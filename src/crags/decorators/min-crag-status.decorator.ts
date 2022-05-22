import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { EntityStatus } from '../entities/enums/entity-status.enum';

export const MinCragStatus = createParamDecorator(
  (_: unknown, context: ExecutionContext) => ResolveMinCragStatus(context),
);

export const ResolveMinCragStatus = (context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const user = ctx.getContext().req.user;

  if (user == null) {
    return EntityStatus.PUBLIC;
  }

  if (user.roles.find(role => role.role == 'admin')) {
    return EntityStatus.ARCHIVE;
  }

  return EntityStatus.HIDDEN;
};
