import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CheckCredentialsDto {
  @IsString()
  @ApiProperty({ example: 'Qwerty1234123' })
  identifier: string;

  @IsString()
  @ApiProperty({ example: 'Qwerty1234123' })
  password: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  rememberUser?: boolean;
}

export class AuthBySmsDto {
  @IsString()
  @ApiProperty({ example: '123456' })
  code: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  rememberUser?: boolean;
}
