import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Country } from '../entities/country.entity';
import { CreateCountryInput } from '../dtos/create-country.input';
import { CountriesService } from '../services/countries.service';
import { UpdateCountryInput } from '../dtos/update-country.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { Crag } from 'src/crags/entities/crag.entity';
import { CragsService } from 'src/crags/services/crags.service';
import { ConflictFilter } from '../filters/conflict.filter';
import { NotFoundFilter } from '../filters/not-found.filter';

@Resolver(() => Country)
export class CountriesResolver {

    constructor(
        private countriesService: CountriesService,
        private cragsService: CragsService
    ) { }

    @Query(() => [Country])
    countries(): Promise<Country[]> {
        return this.countriesService.find();
    }

    @Mutation(() => Country)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(ConflictFilter)
    async createCountry(@Args('input', { type: () => CreateCountryInput }) input: CreateCountryInput): Promise<Country> {
        return this.countriesService.create(input);
    }

    @Mutation(() => Country)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(ConflictFilter, NotFoundFilter)
    async updateCountry(@Args('input', { type: () => UpdateCountryInput }) input: UpdateCountryInput): Promise<Country> {
        return this.countriesService.update(input)
    }

    @Mutation(() => Boolean)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async deleteCountry(@Args('id') id: string): Promise<boolean> {
        return this.countriesService.delete(id)
    }

    @ResolveField('crags', () => [Crag])
    async getCrags(@Parent() country: Country): Promise<Crag[]> {
        return this.cragsService.find({ country: country.id })
    }
}