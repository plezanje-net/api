import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseInterceptors, UseFilters } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { Sector } from '../entities/sector.entity';
import { SectorsService } from '../services/sectors.service';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { UpdateSectorInput } from '../dtos/update-sector.input';

@Resolver(() => Sector)
export class SectorsResolver {

    constructor(
        private sectorsService: SectorsService
    ) { }

    @Mutation(() => Sector)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async createSector(@Args('input', { type: () => CreateSectorInput }) input: CreateSectorInput): Promise<Sector> {
        return this.sectorsService.create(input);
    }

    @Mutation(() => Sector)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async updateSector(@Args('input', { type: () => UpdateSectorInput }) input: UpdateSectorInput): Promise<Sector> {
        return this.sectorsService.update(input)
    }

    @Mutation(() => Boolean)
    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @UseFilters(NotFoundFilter)
    async deleteSector(@Args('id') id: string): Promise<boolean> {
        return this.sectorsService.delete(id)
    }
}
