import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();

    await this.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'project owner',
        hashed_password: await bcrypt.hash('changethis', 10),
        password_updated_at: new Date(),
        email: 'asfgbssm@gmail.com',
        email_verified: true,
      },
    });
  }
}
