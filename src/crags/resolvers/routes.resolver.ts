import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Route } from '../entities/route.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  UseInterceptors,
  UseFilters,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';
import { RoutesService } from '../services/routes.service';
import { Comment } from '../entities/comment.entity';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { Pitch } from '../entities/pitch.entity';
import { RouteCommentsLoader } from '../loaders/route-comments.loader';
import DataLoader from 'dataloader';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import { RoutePitchesLoader } from '../loaders/route-pitches.loader';
import { DifficultyVotesService } from '../services/difficulty-votes.service';
import { Crag } from '../entities/crag.entity';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { ForeignKeyConstraintFilter } from '../filters/foreign-key-constraint.filter';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemLoader } from '../loaders/grading-system.loader';
import { RouteType } from '../entities/route-type.entity';
import { RouteTypeLoader } from '../loaders/route-type.loader';
import { CragLoader } from '../loaders/crag.loader';
import { RouteProperty } from '../entities/route-property.entity';
import { EntityPropertiesService } from '../services/entity-properties.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../notification/services/notification.service';
import { LatestDifficultyVotesInput } from '../dtos/latest-difficulty-votes.input';
import { PaginatedDifficultyVotes } from '../utils/paginated-difficulty-votes';
import { MoveRouteToSectorInput } from '../dtos/move-route-to-sector.input';
import { SectorsService } from '../services/sectors.service';
import { PaginatedActivityRoutes } from '../../activities/utils/paginated-activity-routes.class';
import { ActivityRoutesService } from '../../activities/services/activity-routes.service';
import { FindActivityRoutesInput } from '../../activities/dtos/find-activity-routes.input';
import { StarRatingVotesService } from '../services/star-rating-votes.service';
import { StarRatingVote } from '../entities/star-rating-vote.entity';
import { FindDifficultyVotesInput } from '../dtos/find-difficulty-votes.input';
import { FindStarRatingVotesInput } from '../dtos/find-star-rating-votes.input';

@Resolver(() => Route)
@UseInterceptors(DataLoaderInterceptor)
export class RoutesResolver {
  constructor(
    private routesService: RoutesService,
    private sectorsService: SectorsService,
    private difficultyVotesService: DifficultyVotesService,
    private starRatingVotesService: StarRatingVotesService,
    private entityPropertiesService: EntityPropertiesService,
    private notificationService: NotificationService,
    private activityRoutesService: ActivityRoutesService,
  ) {}

  /* QUERIES */

  @Query(() => Route)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async route(@Args('id') id: string): Promise<Route> {
    return this.routesService.findOneById(id);
  }

  @Query(() => Route)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async routeBySlug(
    @Args('cragSlug') cragSlug: string,
    @Args('routeSlug') routeSlug: string,
    @CurrentUser() user: User,
  ): Promise<Route> {
    return this.routesService.findOneBySlug(cragSlug, routeSlug, user);
  }

  @Query(() => PaginatedDifficultyVotes)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async latestDifficultyVotes(
    @Args('input', { type: () => LatestDifficultyVotesInput })
    input: LatestDifficultyVotesInput,
    @CurrentUser() user: User,
  ): Promise<PaginatedDifficultyVotes> {
    return this.difficultyVotesService.findLatest({ ...input, user: user });
  }

  /* MUTATIONS */

  @Mutation(() => Route)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async createRoute(
    @Args('input', { type: () => CreateRouteInput }) input: CreateRouteInput,
    @CurrentUser() user: User,
  ): Promise<Route> {
    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException();
    }
    return this.routesService.create(input, user);
  }

  @Mutation(() => Route)
  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  async updateRoute(
    @Args('input', { type: () => UpdateRouteInput }) input: UpdateRouteInput,
    @CurrentUser() user: User,
  ): Promise<Route> {
    const route = await this.routesService.findOne({
      id: input.id,
      user,
    });

    if (!user.isAdmin() && route.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException('publish_status_unavailable_to_user');
    }

    const sector = await route.sector;
    if (
      input.publishStatus != null &&
      sector.publishStatus < input.publishStatus
    ) {
      throw new BadRequestException('publish_status_incompatible_with_sector');
    }

    if (route.publishStatus == 'in_review' && input.publishStatus == 'draft') {
      this.notificationService.contributionRejection(
        { route: route },
        await route.user,
        user,
        input.rejectionMessage,
      );
    }

    return this.routesService.update(input);
  }

  @Mutation(() => [Route])
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async updateRoutes(
    @Args('input', { type: () => [UpdateRouteInput] })
    input: UpdateRouteInput[],
  ): Promise<Route[]> {
    return Promise.all(input.map((input) => this.routesService.update(input)));
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter, ForeignKeyConstraintFilter)
  async deleteRoute(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const route = await this.routesService.findOne({
      id: id,
      user,
    });

    if (!user.isAdmin() && route.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    return this.routesService.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  async moveRouteToSector(
    @Args('input', { type: () => MoveRouteToSectorInput })
    input: MoveRouteToSectorInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user.isAdmin()) {
      throw new ForbiddenException();
    }

    const route = await this.routesService.findOne({
      id: input.id,
      user,
    });

    const sector = await this.sectorsService.findOne({
      id: input.sectorId,
      user,
    });

    if (input.targetRouteId) {
      const targetRoute = await this.routesService.findOne({
        id: input.targetRouteId,
        user,
      });

      if (
        route.publishStatus != 'published' ||
        targetRoute.publishStatus != 'published'
      ) {
        throw new BadRequestException('cannot_merge_unpublished_routes');
      }

      if ((await route.pitches).length || (await targetRoute.pitches).length) {
        throw new BadRequestException('cannot_merge_multipitch_routes');
      }

      return this.routesService.moveToSector(
        route,
        sector,
        targetRoute,
        input.primaryRoute ?? 'target',
      );
    }
    return this.routesService.moveToSector(route, sector);
  }

  /* FIELDS */

  @ResolveField('comments', () => [Comment])
  async getComments(
    @Parent() route: Route,
    @Loader(RouteCommentsLoader)
    loader: DataLoader<Comment['id'], Comment[]>,
  ): Promise<Comment[]> {
    return loader.load(route.id);
  }

  @ResolveField('properties', () => [RouteProperty])
  async getProperties(@Parent() route: Route): Promise<RouteProperty[]> {
    return this.entityPropertiesService.getRouteProperties(route);
  }

  @ResolveField('difficultyVotes', () => [DifficultyVote])
  async difficultyVotes(
    @Parent() route: Route,
    @Args('input', { nullable: true }) input: FindDifficultyVotesInput = {},
  ): Promise<DifficultyVote[]> {
    return this.difficultyVotesService.findByRouteId(route.id, input);
  }

  @ResolveField('starRatingVotes', () => [StarRatingVote])
  async starRatingVotes(
    @Parent() route: Route,
    @Args('input', { nullable: true }) input: FindStarRatingVotesInput = {},
  ): Promise<StarRatingVote[]> {
    return this.starRatingVotesService.findByRouteId(route.id, input);
  }

  @ResolveField('crag', () => Crag)
  async getCrag(
    @Parent() route: Route,
    @Loader(CragLoader)
    loader: DataLoader<Crag['id'], Crag>,
  ): Promise<Crag> {
    return loader.load(route.cragId);
  }

  @ResolveField('pitches', () => [Pitch])
  async pitches(
    @Parent() route: Route,
    @Loader(RoutePitchesLoader)
    loader: DataLoader<Pitch['id'], Pitch[]>,
  ): Promise<Pitch[]> {
    return loader.load(route.id);
  }

  @ResolveField('defaultGradingSystem', () => GradingSystem)
  async defaultGradingSystem(
    @Parent() route: Route,
    @Loader(GradingSystemLoader)
    loader: DataLoader<GradingSystem['id'], GradingSystem>,
  ): Promise<GradingSystem> {
    return loader.load(route.defaultGradingSystemId);
  }

  @ResolveField('routeType', () => RouteType)
  async routeType(
    @Parent() route: Route,
    @Loader(RouteTypeLoader)
    loader: DataLoader<RouteType['id'], RouteType>,
  ): Promise<RouteType> {
    return loader.load(route.routeTypeId);
  }

  @ResolveField('activityRoutes', () => PaginatedActivityRoutes)
  @UseGuards(UserAuthGuard)
  async activityRoutes(
    @Parent() route: Route,
    @Args('input', { nullable: true }) input: FindActivityRoutesInput = {},
    @CurrentUser() currentUser: User,
  ): Promise<PaginatedActivityRoutes> {
    return this.activityRoutesService.paginate(
      { ...input, routeId: route.id },
      currentUser,
    );
  }
}
