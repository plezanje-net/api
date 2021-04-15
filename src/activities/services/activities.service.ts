import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';

@Injectable()
export class ActivitiesService {

    constructor(
        @InjectRepository(Activity)
        private activitiesRepository: Repository<Activity>
    ) { }

    async find(params: { user?: User }): Promise<Activity[]> {

        const options: FindManyOptions = {
            order: {
                created: 'DESC'
            }
        }

        const where: any = {};

        if (params.user != null) {
            where.user = params.user.id;
        }

        options.where = where;

        return this.activitiesRepository.find(options);
    }
}
