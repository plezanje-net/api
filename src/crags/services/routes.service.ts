import { Injectable } from '@nestjs/common';
import { Route } from '../entities/route.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { Repository } from 'typeorm';
import { CreateRouteInput } from '../dtos/create-route.input';
import { UpdateRouteInput } from '../dtos/update-route.input';

@Injectable()
export class RoutesService {
    constructor(
        @InjectRepository(Route)
        private routesRepository: Repository<Route>,
        @InjectRepository(Sector)
        private sectorsRepository: Repository<Sector>,
    ) { }

    async create(data: CreateRouteInput): Promise<Route> {
        const route = new Route

        this.routesRepository.merge(route, data);

        route.sector = Promise.resolve(await this.sectorsRepository.findOneOrFail(data.sectorId))

        return this.routesRepository.save(route)
    }

    async update(data: UpdateRouteInput): Promise<Route> {
        const route = await this.routesRepository.findOneOrFail(data.id);

        this.routesRepository.merge(route, data);

        return this.routesRepository.save(route)
    }

    async delete(id: string): Promise<boolean> {
        const route = await this.routesRepository.findOneOrFail(id);

        return this.routesRepository.remove(route).then(() => true)
    }
}
