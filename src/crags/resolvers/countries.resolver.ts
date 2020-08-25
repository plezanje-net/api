import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Country } from '../entities/country.entity';
import { CreateCountryInput } from '../inputs/create-country.input';
import { CountriesService } from '../services/countries.service';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { Crag } from 'src/crags/entities/crag.entity';
import { CragsService } from 'src/crags/services/crags.service';

@Resolver(() => Country)
export class CountriesResolver {

    constructor(
        private countriesService: CountriesService,
        private cragsService: CragsService
    ) { }

    @Query(() => [Country])
    countries(): Promise<Country[]> {
        return this.countriesService.findAll();
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Country)
    async createCountry(@Args('input', { type: () => CreateCountryInput }) input: CreateCountryInput): Promise<Country> {
        return this.countriesService.create(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Country)
    async updateCountry(@Args('input', { type: () => UpdateCountryInput }) input: UpdateCountryInput): Promise<Country> {
        return this.countriesService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Boolean)
    async deleteCountry(@Args('id') id: string): Promise<boolean> {
        return this.countriesService.delete(id)
    }

    @ResolveField('crags', () => [Crag])
    async getRoles(@Parent() country: Country): Promise<Crag[]> {
        return this.cragsService.find({ country: country.id })
    }
}