import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Country } from '../entities/country.entity';
import { CreateCountryInput } from '../inputs/create-country.input';
import { CountriesService } from '../services/countries.service';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuditService } from 'src/audit/services/audit.service';
import { UseInterceptors, forwardRef, Inject } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { Crag } from 'src/crags/entities/crag.entity';
import { CragsService } from 'src/crags/services/crags.service';

@Resolver(of => Country)
export class CountriesResolver {

    constructor(
        private countriesService: CountriesService,
        private cragsService: CragsService
    ) { }

    @Query(returns => [Country])
    countries() {
        return this.countriesService.findAll();
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Country)
    async createCountry(@Args('input', { type: () => CreateCountryInput }) input: CreateCountryInput) {
        return this.countriesService.create(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Country)
    async updateCountry(@Args('input', { type: () => UpdateCountryInput }) input: UpdateCountryInput) {
        return this.countriesService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Boolean)
    async deleteCountry(@Args('id') id: string) {
        return this.countriesService.delete(id)
    }

    @ResolveField('crags', returns => [Crag])
    async getRoles(@Parent() country: Country) {
        return this.cragsService.find({ country: country.id })
    }
}
//@Inject(forwardRef(() => CatsService))