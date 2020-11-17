import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThanOrEqual } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from '../../crags/entities/country.entity';
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

    async findOneById(id: string): Promise<Crag> {
        return this.cragsRepository.findOneOrFail(id);
    }

    async findOneBySlug(slug: string): Promise<Crag> {
        return this.cragsRepository.findOneOrFail({ slug: slug });
    }

    async find(params: { country?: string, area?: string, minStatus?: number }): Promise<Crag[]> {

        const options: FindManyOptions = {
            order: {
                name: 'ASC'
            }
        }

        const where: any = {};

        if (params.country != null) {
            where.country = params.country
        }

        if (params.area != null) {
            where.area = params.area;
        }

        if (params.minStatus != null) {
            where.status = MoreThanOrEqual(params.minStatus)
        }

        options.where = where;

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

    async getMinGrade(crag: Crag): Promise<number> {

        return this.routesRepository
            .createQueryBuilder("route")
            .innerJoinAndSelect("route.sector", "sector")
            .where("sector.crag_id = :cragId AND route.grade IS NOT NULL", { cragId: crag.id })
            .addSelect('route.grade')
            .addOrderBy('route.grade', 'ASC')
            .getOne().then((route) => {
                if (route != null && route.grade != null)
                    return route.grade;

                return null;
            });
    }

    async getMaxGrade(crag: Crag): Promise<number> {

        return this.routesRepository
            .createQueryBuilder("route")
            .innerJoinAndSelect("route.sector", "sector")
            .where("sector.crag_id = :cragId AND route.grade IS NOT NULL", { cragId: crag.id })
            .addSelect('route.grade')
            .addOrderBy('route.grade', 'DESC')
            .getOne().then((route) => {
                if (route != null && route.grade != null) {
                    return route.grade;
                }

                return null;
            });
    }
}
