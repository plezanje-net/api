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
  ForbiddenException,
} from '@nestjs/common';
import { Crag } from '../entities/crag.entity';
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
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { GradingSystem } from '../entities/grading-system.entity';
import { GradingSystemLoader } from '../loaders/grading-system.loader';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import DataLoader from 'dataloader';
import { Country } from '../entities/country.entity';
import { CountryLoader } from '../loaders/country.loader';
import { CragProperty } from '../entities/crag-property.entity';
import { EntityPropertiesService } from '../services/entity-properties.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../notification/services/notification.service';
import { ForeignKeyConstraintFilter } from '../filters/foreign-key-constraint.filter';
import { ImagesService } from '../services/images.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Area } from '../entities/area.entity';
import { AreaLoader } from '../loaders/area.loader';

@Resolver(() => Crag)
@UseInterceptors(DataLoaderInterceptor)
export class CragsResolver {
  constructor(
    private cragsService: CragsService,
    private sectorsService: SectorsService,
    private commentsService: CommentsService,
    private entityPropertiesService: EntityPropertiesService,
    private notificationService: NotificationService,
    private imagesService: ImagesService,
  ) {}

  /* QUERIES */

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  crag(@Args('id') id: string, @CurrentUser() user: User): Promise<Crag> {
    return this.cragsService.findOne({
      id: id,
      user,
    });
  }

  @Query(() => Crag)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async cragBySlug(
    @Args('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    return this.cragsService.findOne({
      slug: slug,
      user,
    });
  }

  @UseGuards(UserAuthGuard)
  // TODO: add conditions for showing 'public' crags to everyone (in service)
  @Query(() => [Crag])
  async crags(): Promise<Crag[]> {
    return this.cragsService.findAll();
  }

  /* MUTATIONS */

  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Crag)
  async createCrag(
    @Args('input', { type: () => CreateCragInput }) input: CreateCragInput,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException();
    }
    return this.cragsService.create(input, user);
  }

  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Crag)
  async updateCrag(
    @Args('input', { type: () => UpdateCragInput }) input: UpdateCragInput,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    const crag = await this.cragsService.findOne({
      id: input.id,
      user,
    });

    if (!user.isAdmin() && crag.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException();
    }

    if (crag.publishStatus == 'in_review' && input.publishStatus == 'draft') {
      this.notificationService.contributionRejection(
        { crag: crag },
        await crag.user,
        user,
        input.rejectionMessage,
      );
    }

    return this.cragsService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter, ForeignKeyConstraintFilter)
  async deleteCrag(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const crag = await this.cragsService.findOne({
      id: id,
      user,
    });

    if (!user.isAdmin() && crag.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    return this.cragsService.delete(id);
  }

  /* FIELDS */

  @ResolveField('nrRoutes', () => Int)
  async nrRoutes(
    @Parent() crag: Crag,
    @CurrentUser() user: User,
  ): Promise<number> {
    if (crag.routeCount != null) {
      return Promise.resolve(crag.routeCount);
    }
    return this.cragsService.getNumberOfRoutes(crag, user);
  }

  @ResolveField('sectors', () => [Sector])
  async getSectors(
    @Parent() crag: Crag,
    @CurrentUser() user: User,
  ): Promise<Sector[]> {
    return this.sectorsService.find({
      cragId: crag.id,
      user,
    });
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
  @UseGuards(UserAuthGuard)
  async getComments(@Parent() crag: Crag): Promise<Comment[]> {
    const comments = await this.commentsService.find({
      cragId: crag.id,
    });

    return comments;
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

  @ResolveField('area', () => Area, { nullable: true })
  async getArea(
    @Parent() crag: Area,
    @Loader(AreaLoader)
    loader: DataLoader<Area['id'], Area>,
  ): Promise<Area> {
    return crag.areaId ? loader.load(crag.areaId) : null;
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  @UseGuards(UserAuthGuard)
  async processAllCrags() {
    await this.cragsService.processAllCrags();
    return true;
  }

  @Query(() => [PopularCrag])
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async popularCrags(
    @CurrentUser() user: User,
    @Args('dateFrom', { nullable: true }) dateFrom?: string,
    @Args('top', { type: () => Int, nullable: true }) top?: number,
  ) {
    return this.cragsService.getPopularCrags(dateFrom, top, user != null);
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  async deleteImage(@CurrentUser() user: User, @Args('id') id: string) {
    const image = await this.imagesService.findOneById(id);
    if ((await image.user).id !== user.id) {
      throw new ForbiddenException();
    }

    return this.imagesService.deleteImage(id);
  }
}
