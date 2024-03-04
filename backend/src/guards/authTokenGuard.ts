import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
} from '@nestjs/common';

import { RedisService } from '../modules/redis/redis.service';
import { RedisStoreTypes } from '../modules/redis/redis.types';

export const AuthTokenGuard = () => {
  class AuthTokenGuard implements CanActivate {
    constructor(
      @Inject(RedisService)
      private readonly redisService: RedisService
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies.AuthToken;
        const userId = await this.redisService.get(
          RedisStoreTypes.AuthorizationToken + token
        );

        if (!userId) return false;

        Reflect.defineMetadata(
          'userId',
          userId,
          context.getHandler()
        );

        return true;
      } catch (e) {
        console.log('AccessTokenGuard error: ', e);
        return false;
      }
    }
  }

  const injectableGuard = mixin(AuthTokenGuard);

  return injectableGuard as new () => {
    [key in keyof AuthTokenGuard]: AuthTokenGuard[key];
  };
};
