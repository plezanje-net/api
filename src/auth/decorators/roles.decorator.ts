import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Roles(
  ...roles: string[]
): <TFunction, Y>(
  target: any | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(GqlAuthGuard, RolesGuard),
  );
}
