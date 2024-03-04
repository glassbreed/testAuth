import { Injectable } from '@nestjs/common/decorators';
import { errorHandler, getRandomDigits } from '../../helpers';
import { RedisService } from '../redis/redis.service';
import nodemailer from 'nodemailer';
import { RedisStoreTypes } from '../redis/redis.types';

@Injectable()
export class MailService {
  readonly transporter: any;

  constructor(private readonly redis: RedisService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sampleDomain.email',
      port: 587,
      secure: false,
      auth: {
        user: 'sampleUser@sampleDomain.email',
        pass: 'qwe123',
      },
    });
  }

  async sendRecoverPasswordCode(email: string) {
    try {
      const code = await getRandomDigits();

      await this.transporter.sendMail({
        from: 'root@mail.email',
        to: email,
        subject: 'Восстановление пароля',
        text: '',
        html: '<h>Шаблон письма </h>',
      });

      await this.redis.set(
        RedisStoreTypes.RecoverPasswordCode + code,
        email,
        900
      );
    } catch (e) {
      return errorHandler(
        {
          pointer: 'sendRecoverPasswordCode service',
          text: 'Не удалось отправить активационный код на почту',
        },
        e
      );
    }
  }
}
