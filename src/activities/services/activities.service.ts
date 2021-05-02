import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationMeta } from 'src/core/utils/pagination-meta.class';
import { FindManyOptions, Repository } from 'typeorm';
import { FindActivitiesInput } from '../dtos/find-activities.input';
import { Activity } from '../entities/activity.entity';
import { PaginatedActivities } from '../utils/paginated-activities.class';

@Injectable()
export class ActivitiesService {

    constructor(
        @InjectRepository(Activity)
        private activitiesRepository: Repository<Activity>
    ) { }

    async paginate(params: FindActivitiesInput = {}): Promise<PaginatedActivities> {

        const options = this.parseOptions(params);

        const itemCount = await this.activitiesRepository.count(options);

        const pagination = new PaginationMeta(itemCount, params.pageNumber, params.pageSize)

        options.skip = pagination.pageSize * (pagination.pageNumber -1);
        options.take = pagination.pageSize;

        return Promise.resolve({
            items: await this.activitiesRepository.find(options),
            meta: pagination
        });
    }

    async find(params: FindActivitiesInput = {}): Promise<Activity[]> {
        return this.activitiesRepository.find(this.parseOptions(params));
    }

    private parseOptions(params: FindActivitiesInput): FindManyOptions {
        const options: FindManyOptions = {
            order: {
                created: 'DESC'
            }
        }

        const where: any = {};

        if (params.userId != null) {
            where.user = params.userId;
        }

        options.where = where;

        return options;
    }
}
