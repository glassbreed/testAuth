import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger/dist';

import {
  HttpExceptionFilter,
  HttpExceptionFilterResDto,
} from '../../exceptionFilters/http.exception.filter';
import { errorHandler } from '../../helpers';
import { UserService } from './user.service';
import {
  CreateUserDto,
  GetUserinfoResDto,
  RecoverPasswordDTO,
} from './user.dto';
import { UserId } from '../../decorators/userId.decorator';
import { AuthTokenGuard } from '../../guards/authTokenGuard';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';

@ApiTags('User')
@Controller('/user/v1')
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Получение информации о пользователе',
  })
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiOkResponse({ type: GetUserinfoResDto })
  @UseGuards(AuthTokenGuard())
  @ApiCookieAuth()
  async getUserinfo(@UserId() userId: string) {
    try {
      const userinfo = await this.userService.getUserById(
        parseInt(userId)
      );

      return userinfo;
    } catch (e) {
      return errorHandler(
        {
          pointer: 'getUserinfo controller',
          text: 'Не удалось получить информацию о пользователе',
        },
        e
      );
    }
  }

  @Post('/')
  @ApiOperation({
    summary:
      'Создание нового пользователя.  В случае успеха происходит переход на redirectUri (если он задан)',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBadRequestResponse({
    type: HttpExceptionFilterResDto,
    description: 'Bad request',
  })
  @ApiQuery({ name: 'redirect_uri', required: false })
  @ApiOkResponse()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
    @Query('redirect_uri') redirectUri?: string
  ) {
    try {
      const userId = await this.userService.createUser(createUserDto);

      await this.authService.setTokens(req, res, userId);
      redirectUri && res.redirect(redirectUri);
    } catch (e) {
      return errorHandler(
        {
          pointer: 'createUser controller',
          text: 'Не удалось  создать пользователя',
        },
        e
      );
    }
  }

  @Put('/recover_password')
  @ApiOperation({
    summary: 'Восстановить пароль по отправленному на почту коду',
  })
  @ApiOkResponse()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiForbiddenResponse({
    type: HttpExceptionFilterResDto,
    description: 'Forbidden',
  })
  @ApiInternalServerErrorResponse({
    type: HttpExceptionFilterResDto,
    description: 'Internal server error',
  })
  async recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDTO,
    @Res() res: Response
  ) {
    try {
      await this.userService.changeUserPasswordByMail(
        recoverPasswordDto
      );

      res.send();
    } catch (e) {
      return errorHandler(
        {
          pointer: 'recoverUserPassword controller',
          text: 'Не удалось восстановить пароль по отправленному на почту коду',
        },
        e
      );
    }
  }
}
