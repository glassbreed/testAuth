import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;
}

export class RecoverPasswordDTO {
  @IsString()
  @ApiProperty({ example: '232367' })
  code: string;

  @IsEmail()
  @ApiProperty({ example: 'test@test.ru' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'qwerty' })
  password: string;
}

export class GetUserinfoResDto {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;
}
