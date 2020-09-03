import { Resolver, Mutation, Args, Query, ResolveField, Int, Parent } from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { Crag } from '../entities/crag.entity';
import { CreateCragInput } from '../dtos/create-crag.input';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { CragsService } from '../services/crags.service';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';

@Resolver(() => Crag)
export class CragsResolver {
    constructor(
        private cragsService: CragsService
    ) { }

    @Query(() => Crag)
    crag(@Args('id') id: string): Promise<Crag> {
        return this.cragsService.findOneById(id);
    }

    @Query(() => [Crag])
    crags(@Args('country', { nullable: true }) country?: string): Promise<Crag[]> {

        const params: any = {};

        if (country != null) {
            params.country = country;
        }

        return this.cragsService.find(params);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Crag)
    async createCrag(@Args('input', { type: () => CreateCragInput }) input: CreateCragInput): Promise<Crag> {
        return this.cragsService.create(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Crag)
    async updateCrag(@Args('input', { type: () => UpdateCragInput }) input: UpdateCragInput): Promise<Crag> {
        return this.cragsService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Boolean)
    async deleteCrag(@Args('id') id: string): Promise<boolean> {
        return this.cragsService.delete(id)
    }

    @ResolveField('nrRoutes', () => Int)
    async getNrRoutes(@Parent() crag: Crag): Promise<number> {
        return this.cragsService.getNumberOfRoutes(crag);
    }

    @ResolveField('minGrade', () => String)
    async getMinGrade(@Parent() crag: Crag): Promise<string> {
        return this.cragsService.getMinGrade(crag);
    }

    @ResolveField('maxGrade', () => String)
    async getMaxGrade(@Parent() crag: Crag): Promise<string> {
        return this.cragsService.getMaxGrade(crag);
    }
}
