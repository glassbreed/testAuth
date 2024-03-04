import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class SendSmsDto {
  @IsPhoneNumber()
  @ApiProperty({ example: '89999999999' })
  phone_number: string;
}
