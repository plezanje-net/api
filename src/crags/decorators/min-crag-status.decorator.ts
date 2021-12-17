import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CragStatus } from '../entities/crag.entity';

export const MinCragStatus = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (user == null) {
      return CragStatus.PUBLIC;
    }

    if (user.roles.includes('admin')) {
      return CragStatus.ADMIN;
    }

    return CragStatus.HIDDEN;
  },
);
