import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info, source } = ctx;
  const { user } = ctx.context.req;
  const roles: string[] = info.parentType.getFields()[info.fieldName].extensions
    .roles;

  if (user == undefined) {
    return null;
  }

  if (roles.includes('self') && user.id == source.id) {
    return next();
  }

  if (user.roles.some((r: string) => roles.includes(r))) {
    return next();
  }

  return null;
};
