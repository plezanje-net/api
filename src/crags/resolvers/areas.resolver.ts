import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Area } from '../entities/area.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from 'src/audit/interceptors/audit.interceptor';
import { UpdateAreaInput } from '../dtos/update-area.input';
import { CreateAreaInput } from '../dtos/create-area.input';
import { AreasService } from '../services/areas.service';

@Resolver(() => Area)
export class AreasResolver {
    constructor(
        private areasService: AreasService
    ) { }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Area)
    async createArea(@Args('input', { type: () => CreateAreaInput }) input: CreateAreaInput): Promise<Area> {
        return this.areasService.create(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Area)
    async updateArea(@Args('input', { type: () => UpdateAreaInput }) input: UpdateAreaInput): Promise<Area> {
        return this.areasService.update(input);
    }

    @Roles('admin')
    @UseInterceptors(AuditInterceptor)
    @Mutation(() => Boolean)
    async deleteArea(@Args('id') id: string): Promise<boolean> {
        return this.areasService.delete(id)
    }


}
