import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import {
  UseInterceptors,
  UseFilters,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Crag, CragStatus } from '../entities/crag.entity';
import { CreateCragInput } from '../dtos/create-crag.input';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { CragsService } from '../services/crags.service';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { Comment } from '../entities/comment.entity';
import { CommentsService } from '../services/comments.service';
import { PopularCrag } from '../utils/popular-crag.class';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemLoader } from '../loaders/grading-system.loader';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import DataLoader from 'dataloader';
import { Country } from '../entities/country.entity';
import { CountryLoader } from '../loaders/country.loader';
import { CragProperty } from '../entities/crag-property.entity';
import { EntityPropertiesService } from '../services/entity-properties.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Resolver(() => Crag)
export class CragsResolver {
  constructor(
    private cragsService: CragsService,
    private sectorsService: SectorsService,
    private commentsService: CommentsService,
    private entityPropertiesService: EntityPropertiesService,
  ) {}

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  crag(
    @Args('id') id: string,
    @MinCragStatus() minStatus: CragStatus,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    return this.cragsService.findOne({
      id: id,
      minStatus: minStatus,
      allowEmpty: true,
      showPrivate: true,
      userId: user?.id,
    });
  }

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async cragBySlug(
    @Args('slug') slug: string,
    @MinCragStatus() minStatus: CragStatus,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    return this.cragsService.findOne({
      slug: slug,
      minStatus: minStatus,
      allowEmpty: true,
      showPrivate: true,
      userId: user?.id,
    });
  }

  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Crag)
  async createCrag(
    @Args('input', { type: () => CreateCragInput }) input: CreateCragInput,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    if (!user.isAdmin() && !['user', 'proposal'].includes(input.status)) {
      throw new BadRequestException();
    }

    return this.cragsService.create(input, user);
  }

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

  @ResolveField('defaultGradingSystem', () => GradingSystem)
  async defaultGradingSystem(
    @Parent() crag: Crag,
    @Loader(GradingSystemLoader)
    loader: DataLoader<GradingSystem['id'], GradingSystem>,
  ): Promise<GradingSystem> {
    return crag.defaultGradingSystemId != null
      ? loader.load(crag.defaultGradingSystemId)
      : null;
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() crag: Crag): Promise<Comment[]> {
    return this.commentsService.find({
      cragId: crag.id,
    });
  }

  @ResolveField('properties', () => [CragProperty])
  async getProperties(@Parent() crag: Crag): Promise<CragProperty[]> {
    return this.entityPropertiesService.getCragProperties(crag);
  }

  @ResolveField('country', () => Country)
  async getCountry(
    @Parent() crag: Crag,
    @Loader(CountryLoader)
    loader: DataLoader<Country['id'], Country>,
  ): Promise<Country> {
    return loader.load(crag.countryId);
  }

  @ResolveField('activityByMonth', () => [Int])
  async getActivityByMonth(@Parent() crag: Crag): Promise<number[]> {
    return this.cragsService.getAcitivityByMonth(crag);
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
