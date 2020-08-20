import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Country } from './entries/country.entity';
import { CreateCountryInput } from './inputs/create-country.input';
import { CountriesService } from './countries.service';
import { UpdateCountryInput } from './inputs/update-country.input';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(of => Country)
export class CountriesResolver {

    constructor(private countriesService: CountriesService) {}

    @Query(returns => [Country])
    countries() {
        return this.countriesService.findAll();
    }

    @Roles('admin')
    @Mutation(returns => Country)
    async createCountry(@Args('input', { type: () => CreateCountryInput }) input: CreateCountryInput) {
        return this.countriesService.create(input);
    }

    @Roles('admin')
    @Mutation(returns => Country)
    async updateCountry(@Args('input', { type: () => UpdateCountryInput }) input: UpdateCountryInput) {
        return this.countriesService.update(input);
    }
}
