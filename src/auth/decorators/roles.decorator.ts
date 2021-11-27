import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { UserAuthGuard } from '../guards/user-auth.guard';

export function Roles(
  ...roles: string[]
): <TFunction, Y>(
  target: any | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(UserAuthGuard, RolesGuard),
  );
}
