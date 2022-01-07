import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { RoutesService } from '../services/routes.service';
import { Route } from '../entities/route.entity';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import { SectorRoutesLoader } from '../loaders/sector-routes.loader';
import DataLoader from 'dataloader';

@Resolver(() => Sector)
export class SectorsResolver {
  constructor(
    private sectorsService: SectorsService,
    private routesService: RoutesService,
  ) {}

  @Mutation(() => Sector)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async createSector(
    @Args('input', { type: () => CreateSectorInput }) input: CreateSectorInput,
  ): Promise<Sector> {
    return this.sectorsService.create(input);
  }

  @Mutation(() => Sector)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async updateSector(
    @Args('input', { type: () => UpdateSectorInput }) input: UpdateSectorInput,
  ): Promise<Sector> {
    return this.sectorsService.update(input);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async deleteSector(@Args('id') id: string): Promise<boolean> {
    return this.sectorsService.delete(id);
  }

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
}
