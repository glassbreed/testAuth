import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger/dist';
import { errorHandler } from '../../helpers';
import { MailService } from './mail.service';
import { SendConfirmationCodeDTO } from './mail.dto';
import {
  HttpExceptionFilter,
  HttpExceptionFilterResDto,
} from '../../exceptionFilters/http.exception.filter';

@ApiTags('Mail')
@Controller('/mail/v1')
@UseFilters(HttpExceptionFilter)
@ApiBadRequestResponse({
  type: HttpExceptionFilterResDto,
  description: 'Bad request',
})
@ApiInternalServerErrorResponse({
  type: HttpExceptionFilterResDto,
  description: 'Internal server error',
})
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/send')
  @ApiOperation({
    summary: 'Отправка активационного кода на почту',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiCreatedResponse()
  @ApiForbiddenResponse({
    type: HttpExceptionFilterResDto,
    description: 'Forbidden',
  })
  async sendCode(
    @Body()
    { email }: SendConfirmationCodeDTO
  ) {
    try {
      await this.mailService.sendRecoverPasswordCode(email);
    } catch (e) {
      return errorHandler(
        {
          pointer: 'sendCode controller',
          text: 'Не удалось отправить активационный код на почту',
        },
        e
      );
    }
  }
}
