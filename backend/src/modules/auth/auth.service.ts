import { Injectable } from '@nestjs/common/decorators';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  errorHandler,
  getIdentifierType,
  prepareIdentifier,
} from '../../helpers';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { RedisStoreTypes } from '../redis/redis.types';

const Cookies = require('cookies');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async getUserIdByCredentials(
    identifier: string,
    password: string
  ): Promise<number> {
    try {
      const identifier_type = getIdentifierType(identifier);
      const preparedIdentifier = prepareIdentifier(
        identifier,
        identifier_type
      );
      let passwordVerified: boolean;

      const user = await this.prisma.user.findFirst({
        where: {
          [identifier_type]:
            typeof preparedIdentifier === 'number'
              ? preparedIdentifier
              : {
                  equals: preparedIdentifier,
                  mode: 'insensitive',
                },
        },
      });

      if (user)
        passwordVerified = await bcrypt.compare(
          password,
          user.hashed_password
        );

      if (!passwordVerified)
        return Promise.reject(
          new HttpException(
            {
              pointer: 'getUserIdByCredentials service',
              text: 'Неверный идентификатор/пароль',
            },
            HttpStatus.FORBIDDEN
          )
        );

      return user.id;
    } catch (e) {
      return errorHandler(
        {
          pointer: 'getUserIdByCredentials service',
          text: 'Ошибка при проверке идентификатора и пароля',
        },
        e
      );
    }
  }

  async setTokens(
    req: Request,
    res: Response,
    userId: number,
    remember?: boolean
  ) {
    try {
      const cookie = new Cookies(req, res);
      const uid = uuidv4();
      const expiresIn = remember ? undefined : 86400;

      await this.redis.set(
        RedisStoreTypes.AuthorizationToken + uid,
        userId,
        expiresIn
      );

      cookie.set('isTokenSet', 'true', {
        overwrite: true,
        domain: 'trusted.com',
        expiresIn,
      });

      cookie.set('AuthToken', uid, {
        httpOnly: true,
        overwrite: true,
        domain: 'trusted.com',
        expiresIn,
      });
    } catch (e) {
      return errorHandler(
        {
          pointer: 'setTokens service',
          text: 'Не удалось задать значения токенов',
        },
        e
      );
    }
  }

  async revokeTokens(req: Request, res: Response) {
    try {
      const token = req.cookies.token;

      await this.redis.delete(
        RedisStoreTypes.AuthorizationToken + token
      );

      res.clearCookie('isTokenSet', { domain: 'trusted.com' });
      res.clearCookie('AuthToken', { domain: 'trusted.com' });
    } catch (e) {
      return errorHandler(
        {
          pointer: 'revokeTokens service',
          text: 'Не удалось отозвать токены',
        },
        e
      );
    }
  }

  async getUserBySmsCode(code: string) {
    try {
      const phone_number = await this.redis.get(
        RedisStoreTypes.AuthorizationCode + code
      );
      const { id } =
        (await this.prisma.user.findUnique({
          where: { phone_number },
          select: { id: true },
        })) || {};

      this.redis.delete(RedisStoreTypes.AuthorizationCode + code);

      if (!id)
        return Promise.reject(
          new HttpException(
            {
              pointer: 'getUserBySmsCode service',
              text: 'Пользователь с таким номером не зарегистрирован',
            },
            HttpStatus.FORBIDDEN
          )
        );

      return id;
    } catch (e) {
      return errorHandler(
        {
          pointer: 'getUserBySmsCode service',
          text: 'Не удалось получить пользователя по смс коду',
        },
        e
      );
    }
  }
}
