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

@Resolver(() => Sector)
export class SectorsResolver {
  constructor(private sectorsService: SectorsService) {}

  /* QUERIES */

  @Query(() => Sector)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  sector(@Args('id') id: string): Promise<Sector> {
    return this.sectorsService.findOneById(id);
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
    if (!user.isAdmin() && !['user', 'proposal'].includes(input.status)) {
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

    if (!user.isAdmin() && !['user', 'proposal'].includes(sector.status)) {
      throw new ForbiddenException();
    }

    if (
      !user.isAdmin() &&
      input.status != null &&
      !['user', 'proposal'].includes(input.status)
    ) {
      throw new BadRequestException();
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
    return Promise.all(input.map(input => this.sectorsService.update(input)));
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

    if (!user.isAdmin() && !['user', 'proposal'].includes(sector.status)) {
      throw new ForbiddenException();
    }

    return this.sectorsService.delete(id);
  }

  /* FIELDS */

  @ResolveField('routes', () => [Route])
  async getRoutes(
    @Parent() sector: Sector,
    @CurrentUser() user: User,
  ): Promise<Route[]> {
    return this.routesService.find({
      sectorId: sector.id,
      user,
    });
  }

  @ResolveField('bouldersOnly', () => Boolean)
  async bouldersOnly(@Parent() sector: Sector) {
    return this.sectorsService.bouldersOnly(sector.id);
  }
}
