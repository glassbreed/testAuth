import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger/dist';
import { AuthService } from './auth.service';
import { AuthBySmsDto, CheckCredentialsDto } from './auth.dto';
import {
  HttpExceptionFilter,
  HttpExceptionFilterResDto,
} from '../../exceptionFilters/http.exception.filter';
import { Request, Response } from 'express';
import { errorHandler } from '../../helpers';
import { AuthTokenGuard } from '../../guards/authTokenGuard';

@ApiTags('Auth')
@Controller('/auth/v1')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Открытие виджета авторизации',
  })
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiOkResponse({ content: { 'text/html': {} } })
  @ApiQuery({ name: 'sms', required: false })
  async openWidget(
    @Res() res: Response,
    @Query('redirect_uri') redirectUri: string,
    @Query('sms') sms?: string
  ) {
    try {
      return res.render('widget', { sms });
    } catch (e) {
      return errorHandler(
        {
          pointer: 'openWidget controller',
          text: 'Не удалось открыть виджет авторизации',
        },
        e
      );
    }
  }

  @Post('/')
  @ApiOperation({
    summary:
      'Поиск пользователя по идентификатору и паролю. В случае успешной аутентификации происходит возврат на redirectUri',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiResponse({ status: 303, description: 'See Other' })
  async checkCredentials(
    @Body()
    { identifier, password, rememberUser }: CheckCredentialsDto,
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId = await this.authService.getUserIdByCredentials(
        identifier,
        password
      );

      await this.authService.setTokens(
        req,
        res,
        userId,
        rememberUser
      );
      res.redirect(redirectUri);
    } catch (e) {
      return errorHandler(
        {
          pointer: 'checkCredentials controller',
          text: 'Не удалось проверить адрес почты и пароль',
        },
        e
      );
    }
  }

  @Get('/logout')
  @ApiOperation({
    summary: 'Отзыв токена авторизации',
  })
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiResponse({ status: 303, description: 'See Other' })
  @ApiCookieAuth()
  @UseGuards(AuthTokenGuard())
  async logout(
    @Query('redirect_uri') redirectUri: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      await this.authService.revokeTokens(req, res);

      res.redirect(redirectUri);
    } catch (e) {
      return errorHandler(
        {
          pointer: 'logout controller',
          text: 'Не удалось отозвать токен',
        },
        e
      );
    }
  }

  @Post('/sms')
  @ApiOperation({
    summary:
      'Поиск пользователя по номеру, на который был отправлен смс-код. В случае успешной аутентификации происходит возврат на redirectUri',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiResponse({ status: 303, description: 'See Other' })
  async sendSms(
    @Body() { code, rememberUser }: AuthBySmsDto,
    @Query('redirect_uri') redirectUri: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = await this.authService.getUserBySmsCode(code);

      await this.authService.setTokens(
        req,
        res,
        userId,
        rememberUser
      );
      res.redirect(redirectUri);
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
