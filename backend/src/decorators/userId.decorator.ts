import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core/services';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const reflector = new Reflector();
    const userId = reflector.get<string>(
      'userId',
      context.getHandler()
    );

    return parseInt(userId, 10);
  }
);
