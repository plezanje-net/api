import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Query,
} from '@nestjs/graphql';
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
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { Route } from '../entities/route.entity';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { ForeignKeyConstraintFilter } from '../filters/foreign-key-constraint.filter';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../notification/services/notification.service';
import { SectorRoutesLoader } from '../loaders/sector-routes.loader';
import DataLoader from 'dataloader';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import { CragsService } from '../services/crags.service';
import { UserLoader } from '../../users/loaders/user.loader';
import { Parking } from '../entities/parking.entity';
import { ParkingsService } from '../services/parkings.service';

@Resolver(() => Sector)
@UseInterceptors(DataLoaderInterceptor)
export class SectorsResolver {
  constructor(
    private cragsService: CragsService,
    private sectorsService: SectorsService,
    private notificationService: NotificationService,
    private parkingsService: ParkingsService,
  ) {}

  /* QUERIES */

  @Query(() => Sector)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  sector(@Args('id') id: string, @CurrentUser() user: User): Promise<Sector> {
    return this.sectorsService.findOne({ id: id, user: user });
  }

  /* MUTATIONS */

  @Mutation(() => Sector)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async createSector(
    @Args('input', { type: () => CreateSectorInput }) input: CreateSectorInput,
    @CurrentUser() user: User,
  ): Promise<Sector> {
    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException();
    }
    return this.sectorsService.create(input, user);
  }

  @Mutation(() => Sector)
  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  async updateSector(
    @Args('input', { type: () => UpdateSectorInput }) input: UpdateSectorInput,
    @CurrentUser() user: User,
  ): Promise<Sector> {
    const sector = await this.sectorsService.findOne({
      id: input.id,
      user,
    });

    if (!user.isAdmin() && sector.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    if (!user.isAdmin() && input.publishStatus == 'published') {
      throw new BadRequestException('publish_status_unavailable_to_user');
    }

    const crag = await sector.crag;
    if (
      input.publishStatus != null &&
      crag.publishStatus < input.publishStatus
    ) {
      throw new BadRequestException('publish_status_incompatible_with_crag');
    }

    if (sector.publishStatus == 'in_review' && input.publishStatus == 'draft') {
      this.notificationService.contributionRejection(
        { sector: sector },
        await sector.user,
        user,
        input.rejectionMessage,
      );
    }

    return this.sectorsService.update(input);
  }

  @Mutation(() => [Sector])
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async updateSectors(
    @Args('input', { type: () => [UpdateSectorInput] })
    input: UpdateSectorInput[],
  ): Promise<Sector[]> {
    return Promise.all(input.map((input) => this.sectorsService.update(input)));
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter, ForeignKeyConstraintFilter)
  async deleteSector(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const sector = await this.sectorsService.findOne({
      id: id,
      user,
    });

    if (!user.isAdmin() && sector.publishStatus != 'draft') {
      throw new ForbiddenException();
    }

    return this.sectorsService.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(UserAuthGuard)
  @UseFilters(NotFoundFilter)
  @UseInterceptors(AuditInterceptor)
  async moveSectorToCrag(
    @Args('id') id: string,
    @Args('cragId') cragId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const sector = await this.sectorsService.findOne({
      id,
      user,
    });

    const crag = await this.cragsService.findOne({
      id: cragId,
      user,
    });

    if (!user.isAdmin()) {
      throw new ForbiddenException();
    }

    return this.sectorsService.moveToCrag(sector, crag);
  }

  /* FIELDS */

  @ResolveField('routes', () => [Route])
  async getRoutes(
    @Parent() sector: Sector,
    @Loader(SectorRoutesLoader)
    loader: DataLoader<Route['id'], Route[]>,
  ): Promise<Route[]> {
    return loader.load(sector.id);
  }

  @ResolveField('bouldersOnly', () => Boolean)
  async bouldersOnly(@Parent() sector: Sector) {
    return this.sectorsService.bouldersOnly(sector.id);
  }

  @ResolveField('user', () => User, { nullable: true })
  async getUser(
    @Parent() sector: Sector,
    @Loader(UserLoader)
    loader: DataLoader<Sector['userId'], User>,
  ): Promise<User> {
    return sector.userId ? loader.load(sector.userId) : null;
  }

  @ResolveField('parkings', () => [Parking])
  async getParkings(@Parent() sector: Sector): Promise<Parking[]> {
    return this.parkingsService.getParkings(sector.id);
  }
}
