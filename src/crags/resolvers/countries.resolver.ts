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
import { Crag, CragStatus } from '../entities/crag.entity';
import { CragsService } from '../services/crags.service';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Area } from '../entities/area.entity';
import { AreasService } from '../services/areas.service';
import { FindCragsInput } from '../dtos/find-crags.input';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';

@Resolver(() => Country)
export class CountriesResolver {
  constructor(
    private countriesService: CountriesService,
    private cragsService: CragsService,
    private areaService: AreasService,
  ) {}

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

  @ResolveField('crags', () => [Crag])
  async getCrags(
    @MinCragStatus() minStatus: CragStatus,
    @Parent() country: Country,
    @Args('input', { nullable: true }) input: FindCragsInput = {},
  ): Promise<Crag[]> {
    input.country = country.id;

    input.minStatus = minStatus;

    return this.cragsService.find(input);
  }

  @ResolveField('areas', () => [Area])
  async getAreas(@Parent() country: Country): Promise<Area[]> {
    return this.areaService.find({ hasCrags: true, countryId: country.id });
  }
}
