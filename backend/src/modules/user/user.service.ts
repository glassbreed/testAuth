import { Injectable } from '@nestjs/common/decorators';
import { errorHandler } from '../../helpers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, RecoverPasswordDTO } from './user.dto';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { RedisStoreTypes } from '../redis/redis.types';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async createUser({ password, ...rest }: CreateUserDto) {
    try {
      const hashed_password = await bcrypt.hash('changethis', 10);

      const user = await this.prisma.user.create({
        data: { ...rest, hashed_password },
      });

      return user.id;
    } catch (e) {
      return errorHandler(
        {
          pointer: 'createUser service',
          text: 'Не удалось создать пользователя',
        },
        e
      );
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      return user;
    } catch (e) {
      return errorHandler(
        {
          pointer: 'getUserById service',
          text: 'Не удалось получить пользователя по айди',
        },
        e
      );
    }
  }

  async changeUserPasswordByMail({
    email,
    code,
    password,
  }: RecoverPasswordDTO) {
    try {
      const email = await this.redis.get(
        RedisStoreTypes.RecoverPasswordCode + code
      );

      if (!email)
        return Promise.reject(
          new HttpException(
            {
              pointer: 'changeUserPasswordByMail service',
              text: 'Код не найден',
            },
            HttpStatus.BAD_REQUEST
          )
        );

      await this.prisma.user.update({
        where: { email },
        data: {
          hashed_password: await bcrypt.hash(password, 10),
          password_updated_at: new Date(),
        },
      });

      await this.redis.delete(
        RedisStoreTypes.RecoverPasswordCode + code
      );
    } catch (e) {
      return errorHandler(
        {
          pointer: 'changeUserPasswordByMail service',
          text: 'Не удалось изменить пароль пользователя',
        },
        e
      );
    }
  }
}
