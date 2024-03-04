import { Injectable } from '@nestjs/common/decorators';
import { errorHandler, getRandomDigits } from '../../helpers';
import { RedisService } from '../redis/redis.service';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class SmsService {
  constructor(private readonly redis: RedisService) {}

  async sendSms({
    phoneNumber,
    message,
    admin_login,
    admin_password,
  }: {
    phoneNumber: string;
    message: string;
    admin_login: string;
    admin_password: string;
  }) {
    try {
      const response = await fetch('https://smsc.ru/rest/send/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: admin_login,
          psw: admin_password,
          phones: phoneNumber,
          mes: message,
          fmt: 3,
        }),
      });

      const json = await response.json();
      const errorCode = json?.error_code;

      if (errorCode) {
        Promise.reject(
          new HttpException(
            {
              pointer: 'sendSms service',
              text: 'Ошибка сервера отправки смс',
            },
            response.status,
            { cause: errorCode }
          )
        );
      }
    } catch (e) {
      return errorHandler(
        {
          pointer: 'sendSms service',
          text: 'Не удалось отправить сообщение',
        },
        e
      );
    }
  }

  async sendAuthorizationCode(phoneNumber: string) {
    try {
      const code = await getRandomDigits();

      await this.sendSms({
        phoneNumber,
        message: 'Код авторизации: ' + code,
        admin_login: 'ADMIN_LOGIN',
        admin_password: 'ADMIN_PASSWORD',
      });

      await this.redis.set(
        'AuthorizationCode:' + code,
        phoneNumber,
        900
      );
    } catch (e) {
      return errorHandler(
        {
          pointer: 'sendAuthorizationCode service',
          text: 'Не удалось отправить активационный СМС-код',
        },
        e
      );
    }
  }
}
