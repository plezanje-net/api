import { Resolver, Mutation, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { Crag } from '../entities/crag.entity';
import { CreateCragInput } from '../inputs/create-crag.input';
import { UpdateCragInput } from '../inputs/update-crag.input';
import { CragsService } from '../services/crags.service';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { Country } from '../entities/country.entity';
import { CountriesService } from '../services/countries.service';

@Resolver(of => Crag)
export class CragsResolver {
    constructor(
        private cragsService: CragsService,
        private countriesService: CountriesService
    ) { }

    @Query(returns => [Crag])
    crags(@Args('country', { nullable: true }) country?: string) {

        const params: any = {};

        if (country != null) {
            params.country = country;
        }

        return this.cragsService.find(params);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Crag)
    async createCrag(@Args('input', { type: () => CreateCragInput }) input: CreateCragInput) {
        return this.cragsService.create(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Crag)
    async updateCrag(@Args('input', { type: () => UpdateCragInput }) input: UpdateCragInput) {
        return this.cragsService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(returns => Boolean)
    async deleteCrag(@Args('id') id: string) {
        return this.cragsService.delete(id)
    }

    @ResolveField('country', returns => Country)
    async getRoles(@Parent() crag: Crag) {
        return this.countriesService.get(crag.country)
    }
}
