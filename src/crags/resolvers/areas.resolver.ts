import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Area } from '../entities/area.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { UpdateAreaInput } from '../dtos/update-area.input';
import { CreateAreaInput } from '../dtos/create-area.input';
import { AreasService } from '../services/areas.service';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Country } from '../entities/country.entity';
import { Loader } from '../../core/interceptors/data-loader.interceptor';
import { CountryLoader } from '../loaders/country.loader';
import { Crag } from '../entities/crag.entity';
import DataLoader from 'dataloader';

@Resolver(() => Area)
export class AreasResolver {
  constructor(private areasService: AreasService) {}

  @Query(() => Area)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  async areaBySlug(@Args('slug') slug: string): Promise<Area> {
    return this.areasService.findOneBySlug(slug);
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Area)
  async createArea(
    @Args('input', { type: () => CreateAreaInput }) input: CreateAreaInput,
  ): Promise<Area> {
    return this.areasService.create(input);
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Area)
  async updateArea(
    @Args('input', { type: () => UpdateAreaInput }) input: UpdateAreaInput,
  ): Promise<Area> {
    return this.areasService.update(input);
  }

  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @Mutation(() => Boolean)
  async deleteArea(@Args('id') id: string): Promise<boolean> {
    return this.areasService.delete(id);
  }

  @ResolveField('country', () => Country)
  async getCountry(
    @Parent() crag: Crag,
    @Loader(CountryLoader)
    loader: DataLoader<Country['id'], Country>,
  ): Promise<Country> {
    return loader.load(crag.countryId);
  }
}
