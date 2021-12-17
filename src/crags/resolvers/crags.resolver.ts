import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { UseInterceptors, UseFilters, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Crag, CragStatus } from '../entities/crag.entity';
import { CreateCragInput } from '../dtos/create-crag.input';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { CragsService } from '../services/crags.service';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { Comment, CommentType } from '../entities/comment.entity';
import { CommentsService } from '../services/comments.service';
import { PopularCrag } from '../utils/popular-crag.class';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';

@Resolver(() => Crag)
export class CragsResolver {
  constructor(
    private cragsService: CragsService,
    private sectorsService: SectorsService,
    private commentsService: CommentsService,
  ) {}

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  crag(
    @Args('id') id: string,
    @MinCragStatus() minStatus: CragStatus,
  ): Promise<Crag> {
    return this.cragsService.findOne({
      id: id,
      minStatus: minStatus,
    });
  }

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async cragBySlug(
    @Args('slug') slug: string,
    @MinCragStatus() minStatus: CragStatus,
  ): Promise<Crag> {
    return this.cragsService.findOne({
      slug: slug,
      minStatus: minStatus,
    });
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Crag)
  async createCrag(
    @Args('input', { type: () => CreateCragInput }) input: CreateCragInput,
  ): Promise<Crag> {
    return this.cragsService.create(input);
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Crag)
  async updateCrag(
    @Args('input', { type: () => UpdateCragInput }) input: UpdateCragInput,
  ): Promise<Crag> {
    return this.cragsService.update(input);
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Boolean)
  async deleteCrag(@Args('id') id: string): Promise<boolean> {
    return this.cragsService.delete(id);
  }

  @ResolveField('nrRoutes', () => Int)
  nrRoutes(@Parent() crag: Crag): number {
    return crag.routeCount ?? crag.nrRoutes;
  }

  @ResolveField('sectors', () => [Sector])
  async getSectors(@Parent() crag: Crag): Promise<Sector[]> {
    return this.sectorsService.findByCrag(crag.id);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() crag: Crag): Promise<Comment[]> {
    return this.commentsService.find({
      cragId: crag.id,
    });
  }

  @Query(() => [PopularCrag])
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async popularCrags(
    @MinCragStatus() minStatus: CragStatus,
    @Args('dateFrom', { nullable: true }) dateFrom?: string,
    @Args('top', { type: () => Int, nullable: true }) top?: number,
  ) {
    return this.cragsService.getPopularCrags(dateFrom, top, minStatus);
  }
}
