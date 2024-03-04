import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendConfirmationCodeDTO {
  @IsEmail()
  @ApiProperty({ example: 'test@mail.com' })
  email: string;
}
