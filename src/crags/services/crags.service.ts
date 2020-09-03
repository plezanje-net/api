import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from 'src/crags/entities/country.entity';
import { Route } from '../entities/route.entity';
import { Area } from '../entities/area.entity';

@Injectable()
export class CragsService {
    constructor(
        @InjectRepository(Route)
        private routesRepository: Repository<Route>,
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>,
        @InjectRepository(Area)
        private areasRepository: Repository<Area>
    ) { }

    findOneById(id: string): Promise<Crag> {
        return this.cragsRepository.findOneOrFail(id);
    }

    find(params: { country?: any }): Promise<Crag[]> {

        const options: FindManyOptions = {
            order: {
                name: 'ASC'
            }
        }

        if (params.country != null) {
            options.where = {
                country: params.country
            }
        }

        return this.cragsRepository.find(options);
    }

    async create(data: CreateCragInput): Promise<Crag> {
        const crag = new Crag

        this.cragsRepository.merge(crag, data);

        crag.country = Promise.resolve(await this.countryRepository.findOneOrFail(data.countryId))

        if (data.areaId != null) {
            crag.area = Promise.resolve(await this.areasRepository.findOneOrFail(data.areaId))
        }

        return this.cragsRepository.save(crag)
    }

    async update(data: UpdateCragInput): Promise<Crag> {
        const crag = await this.cragsRepository.findOneOrFail(data.id);

        this.cragsRepository.merge(crag, data);

        if (data.areaId != null) {
            crag.area = Promise.resolve(await this.areasRepository.findOneOrFail(data.areaId))
        }

        if (data.areaId == null) {
            crag.area = null;
        }

        return this.cragsRepository.save(crag)
    }

    async delete(id: string): Promise<boolean> {
        const crag = await this.cragsRepository.findOneOrFail(id);

        return this.cragsRepository.remove(crag).then(() => true)
    }

    async getNumberOfRoutes(crag: Crag): Promise<number> {

        return this.routesRepository
            .createQueryBuilder("route")
            .innerJoinAndSelect("route.sector", "sector")
            .where("sector.crag_id = :cragId", { cragId: crag.id })
            .getCount();
    }

    async getMinGrade(crag: Crag): Promise<string> {

        return this.routesRepository
            .createQueryBuilder("route")
            .innerJoinAndSelect("route.sector", "sector")
            .where("sector.crag_id = :cragId", { cragId: crag.id })
            .addSelect('route.grade')
            .addOrderBy('route.gradeNum', 'ASC')
            .getOne().then((route) => {
                if (route != null)
                    return route.grade;

                return '';
            });
    }

    async getMaxGrade(crag: Crag): Promise<string> {

        return this.routesRepository
            .createQueryBuilder("route")
            .innerJoinAndSelect("route.sector", "sector")
            .where("sector.crag_id = :cragId", { cragId: crag.id })
            .addSelect('route.grade')
            .addOrderBy('route.gradeNum', 'DESC')
            .getOne().then((route) => {
                if (route != null)
                    return route.grade;

                return '';
            });
    }
}
