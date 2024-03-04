import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger/dist';

import {
  HttpExceptionFilter,
  HttpExceptionFilterResDto,
} from '../../exceptionFilters/http.exception.filter';
import { errorHandler, getRandomDigits } from '../../helpers';
import { SmsService } from './sms.service';
import { SendSmsDto } from './sms.dto';

@ApiTags('SMS')
@Controller('/sms/v1')
@UseFilters(HttpExceptionFilter)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/send')
  @ApiOperation({
    summary: 'Отправка активационного кода по смс',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiOkResponse()
  async sendSms(@Body() { phone_number }: SendSmsDto) {
    try {
      await this.smsService.sendAuthorizationCode(phone_number);
    } catch (e) {
      return errorHandler(
        {
          pointer: 'sendSms controller',
          text: 'Не удалось отправить активационный код',
        },
        e
      );
    }
  }
}
