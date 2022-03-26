import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CragStatus } from '../entities/crag.entity';

export const MinCragStatus = createParamDecorator(
  (_: unknown, context: ExecutionContext) => ResolveMinCragStatus(context),
);

export const ResolveMinCragStatus = (context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const user = ctx.getContext().req.user;

  if (user == null) {
    return CragStatus.PUBLIC;
  }

  if (user.roles.find(role => role.role == 'admin')) {
    return CragStatus.ARCHIVE;
  }

  return CragStatus.HIDDEN;
};
