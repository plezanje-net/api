import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Country } from '../entities/country.entity';
import { CreateCountryInput } from '../dtos/create-country.input';
import { FindCountriesInput } from '../dtos/find-countries.input';
import { CountriesService } from '../services/countries.service';
import { UpdateCountryInput } from '../dtos/update-country.input';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters, UseGuards } from '@nestjs/common';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { ConflictFilter } from '../filters/conflict.filter';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Crag } from '../entities/crag.entity';
import { CragsService } from '../services/crags.service';
import { Area } from '../entities/area.entity';
import { AreasService } from '../services/areas.service';
import { FindCragsInput } from '../dtos/find-crags.input';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { PeaksService } from '../services/peaks.service';
import { Peak } from '../entities/peak.entity';
import { IceFallsService } from '../services/ice-falls.service';
import { IceFall } from '../entities/ice-fall.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { DataLoaderInterceptor } from '../../core/interceptors/data-loader.interceptor';

@Resolver(() => Country)
@UseInterceptors(DataLoaderInterceptor)
export class CountriesResolver {
  constructor(
    private countriesService: CountriesService,
    private cragsService: CragsService,
    private areaService: AreasService,
    private peaksService: PeaksService,
    private iceFallsService: IceFallsService,
  ) {}

  /* QUERIES */

  @Query(() => Country)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async countryBySlug(@Args('slug') slug: string): Promise<Country> {
    return this.countriesService.findOneBySlug(slug);
  }

  @Query(() => [Country])
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  countries(
    @Args('input', { nullable: true }) input?: FindCountriesInput,
  ): Promise<Country[]> {
    return this.countriesService.find(input);
  }

  /* MUTATIONS */

  @Mutation(() => Country)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(ConflictFilter)
  async createCountry(
    @Args('input', { type: () => CreateCountryInput })
    input: CreateCountryInput,
  ): Promise<Country> {
    return this.countriesService.create(input);
  }

  @Mutation(() => Country)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(ConflictFilter, NotFoundFilter)
  async updateCountry(
    @Args('input', { type: () => UpdateCountryInput })
    input: UpdateCountryInput,
  ): Promise<Country> {
    return this.countriesService.update(input);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  @UseInterceptors(AuditInterceptor)
  @UseFilters(NotFoundFilter)
  async deleteCountry(@Args('id') id: string): Promise<boolean> {
    return this.countriesService.delete(id);
  }

  /* FIELDS */

  @ResolveField('crags', () => [Crag])
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async getCrags(
    @Parent() country: Country,
    @Args('input', { nullable: true })
    input: FindCragsInput = {},
    @CurrentUser() user: User,
  ): Promise<Crag[]> {
    return this.cragsService.find({
      ...input,
      country: country.id,
      user,
    });
  }

  @ResolveField('areas', () => [Area])
  async getAreas(
    @Parent() country: Country,
    @Args('hasCrags', { nullable: true }) hasCrags: boolean,
  ): Promise<Area[]> {
    return this.areaService.find({
      hasCrags: hasCrags,
      countryId: country.id,
      areaId: null,
    });
    // TODO: areaId is always set to null and this service method is only called here and the only one that uses FindAreasInput, so areaId param is redundant
  }

  @ResolveField('iceFalls', () => [IceFall])
  async getIcefalls(
    @Parent() country: Country,
    @Args('areaSlug', { nullable: true }) areaSlug?: string,
  ) {
    return this.iceFallsService.getIceFalls(country.id, areaSlug);
  }

  @ResolveField('nrIceFalls', () => Number)
  async getNumberOfIceFalls(@Parent() country: Country) {
    return this.iceFallsService.nrIceFallsByCountry(country.id);
  }

  @ResolveField('peaks', () => [Peak])
  async getPeaks(
    @Parent() country: Country,
    @Args('areaSlug', { nullable: true }) areaSlug?: string,
  ) {
    return this.peaksService.getPeaks(country.id, areaSlug);
  }

  @ResolveField('nrPeaks', () => Number)
  async getNumberOfPeaks(@Parent() country: Country) {
    return this.peaksService.nrPeaksByCountry(country.id);
  }
}
