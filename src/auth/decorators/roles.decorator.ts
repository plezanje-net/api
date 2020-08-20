import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Roles(...roles: string[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(GqlAuthGuard, RolesGuard));
}