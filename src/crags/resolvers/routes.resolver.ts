import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Route } from '../entities/route.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { RoutesService } from '../services/routes.service';

@Resolver(() => Route)
export class RoutesResolver {
    constructor(
        private routesService: RoutesService
    ) { }

    @Mutation(() => Route)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async createRoute(@Args('input', { type: () => CreateRouteInput }) input: CreateRouteInput): Promise<Route> {
        return this.routesService.create(input);
    }

    @Mutation(() => Route)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async updateRoute(@Args('input', { type: () => UpdateRouteInput }) input: UpdateRouteInput): Promise<Route> {
        return this.routesService.update(input)
    }

    @Mutation(() => Boolean)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async deleteRoute(@Args('id') id: string): Promise<boolean> {
        return this.routesService.delete(id)
    }
}
