import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Crag } from './entities/crag.entity';
import { CountriesService } from 'src/countries/countries.service';
import { CreateCragInput } from './inputs/create-crag.input';
import { CragsService } from './crags.service';

@Resolver(of => Crag)
export class CragsResolver {
    constructor(private cragsService: CragsService) {}

    @Roles('admin')
    @Mutation(returns => Crag)
    async createCrag(@Args('input', { type: () => CreateCragInput }) input: CreateCragInput) {
        return this.cragsService.create(input);
    }
}
