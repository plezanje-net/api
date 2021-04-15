import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Route } from '../entities/route.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { RoutesService } from '../services/routes.service';
import { CommentsService } from '../services/comments.service';
import { Comment, CommentType } from '../entities/comment.entity';

@Resolver(() => Route)
export class RoutesResolver {
    constructor(
        private routesService: RoutesService,
        private commentsService: CommentsService
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

    @Query(() => Route)
    @UseFilters(NotFoundFilter)
    async route(@Args('id') id: string): Promise<Route> {
        return this.routesService.findOneById(id);
    }

    @ResolveField('warnings', () => [Comment])
    async getWarnings(@Parent() route: Route): Promise<Comment[]> {
        return this.commentsService.find({ routeId: route.id, type: CommentType.WARNING });
    }

    @ResolveField('conditions', () => [Comment])
    async getConditions(@Parent() route: Route): Promise<Comment[]> {
        return this.commentsService.find({ routeId: route.id, type: CommentType.CONDITION });
    }

    @ResolveField('comments', () => [Comment])
    async getComments(@Parent() route: Route): Promise<Comment[]> {
        return this.commentsService.find({ routeId: route.id, type: CommentType.COMMENT });
    }
}
