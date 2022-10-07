import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const NonGqlCurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
