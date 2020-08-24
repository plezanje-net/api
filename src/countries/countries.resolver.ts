import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Country } from './entities/country.entity';
import { CreateCountryInput } from './inputs/create-country.input';
import { CountriesService } from './countries.service';
import { UpdateCountryInput } from './inputs/update-country.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuditService } from 'src/audit/audit.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/audit.interceptor';

@Resolver(of => Country)
export class CountriesResolver {

    constructor(private countriesService: CountriesService, private auditService: AuditService) { }

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
    async updateCountry(@CurrentUser() user: User, @Args('input', { type: () => UpdateCountryInput }) input: UpdateCountryInput) {
        return this.countriesService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Boolean)
    async deleteCountry(@Args('id') id: string) {
        return this.countriesService.delete(id)
    }
}
