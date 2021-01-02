import { Resolver, Mutation, Args, Query, ResolveField, Int, Parent, Float } from '@nestjs/graphql';
import { UseInterceptors, UseFilters } from '@nestjs/common';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Crag } from '../entities/crag.entity';
import { CreateCragInput } from '../dtos/create-crag.input';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { CragsService } from '../services/crags.service';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';

@Resolver(() => Crag)
export class CragsResolver {
    constructor(
        private cragsService: CragsService,
        private sectorsService: SectorsService
    ) { }

    @Query(() => Crag)
    crag(@Args('id') id: string): Promise<Crag> {
        return this.cragsService.findOneById(id);
    }

    @Query(() => Crag)
    @UseFilters(NotFoundFilter)
    async cragBySlug(@Args('slug') slug: string): Promise<Crag> {
        return this.cragsService.findOneBySlug(slug);
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

    // @ResolveField('nrRoutes', () => Int)
    // async getNrRoutes(@Parent() crag: Crag): Promise<number> {
    //     return this.cragsService.getNumberOfRoutes(crag);
    // }

    // @ResolveField('minGrade', () => Float, { nullable: true })
    // async getMinGrade(@Parent() crag: Crag): Promise<number> {
    //     return this.cragsService.getMinGrade(crag);
    // }

    // @ResolveField('maxGrade', () => Float, { nullable: true })
    // async getMaxGrade(@Parent() crag: Crag): Promise<number> {
    //     return this.cragsService.getMaxGrade(crag);
    // }

    @ResolveField('sectors', () => [Sector])
    async getSectors(@Parent() crag: Crag): Promise<Sector[]> {
        return this.sectorsService.findByCrag(crag.id);
    }
}
