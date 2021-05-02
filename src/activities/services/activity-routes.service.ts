import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from 'src/core/utils/pagination-meta.class';
import { FindManyOptions, In, IsNull, Not, Repository } from 'typeorm';
import { FindActivityRoutesInput } from '../dtos/find-activity-routes.input';
import { ActivityRoute } from '../entities/activity-route.entity';
import { PaginatedActivityRoutes } from '../utils/paginated-activity-routes.class';

@Injectable()
export class ActivityRoutesService {
    
    constructor(
        @InjectRepository(ActivityRoute)
        private activityRoutesRepository: Repository<ActivityRoute>
    ) { }

    async paginate(params: FindActivityRoutesInput = {}): Promise<PaginatedActivityRoutes> {

        const options = this.parseOptions(params);

        const itemCount = await this.activityRoutesRepository.count(options);

        const pagination = new PaginationMeta(itemCount, params.pageNumber, params.pageSize)

        options.skip = pagination.pageSize * (pagination.pageNumber -1);
        options.take = pagination.pageSize;

        return Promise.resolve({
            items: await this.activityRoutesRepository.find(options),
            meta: pagination
        });
    }

    async find(params: FindActivityRoutesInput = {}): Promise<ActivityRoute[]> {
        return this.activityRoutesRepository.find(this.parseOptions(params));
    }

    private parseOptions(params: FindActivityRoutesInput): FindManyOptions {

        const options: FindManyOptions = {
            order: {}
        }

        if (params.orderBy != null) {
            options.order[params.orderBy.field || "created"] = params.orderBy.direction || "DESC";
        }

        const where: any = {};
        
        if (params.orderBy != null && params.orderBy.field == "grade") {
            where.grade = Not(IsNull())
        }

        if (params.userId != null) {
            where.user = params.userId;
        }

        if (params.ascentType != null) {
            where.ascentType = In(params.ascentType.split(';'));
        }

        options.where = where;

        return options;
    }
}
