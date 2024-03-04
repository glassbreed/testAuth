import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { SmsModule } from './sms/sms.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    RedisModule,
    UserModule,
    SmsModule,
    MailModule,
  ],
})
export class RootModule {}
