import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core/services';

export const Role = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const reflector = new Reflector();
    const role = reflector.get<string>('role', context.getHandler());

    return role;
  }
);
