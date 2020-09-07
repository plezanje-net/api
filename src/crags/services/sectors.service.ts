import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { Repository } from 'typeorm';
import { UpdateSectorInput } from '../dtos/update-sector.input';
import { CreateSectorInput } from '../dtos/create-sector.input';
import { Crag } from '../entities/crag.entity';

@Injectable()
export class SectorsService {
    constructor(
        @InjectRepository(Sector)
        private sectorsRepository: Repository<Sector>,
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>,
    ) { }

    async findByCrag(cragId: string): Promise<Sector[]> {
        return this.sectorsRepository.find({ where: { crag: cragId } });
    }

    async create(data: CreateSectorInput): Promise<Sector> {
        const sector = new Sector();

        this.sectorsRepository.merge(sector, data);

        sector.crag = Promise.resolve(await this.cragsRepository.findOneOrFail(data.cragId));

        return this.sectorsRepository.save(sector)
    }

    async update(data: UpdateSectorInput): Promise<Sector> {
        const sector = await this.sectorsRepository.findOneOrFail(data.id);

        this.sectorsRepository.merge(sector, data);

        return this.sectorsRepository.save(sector)
    }

    async delete(id: string): Promise<boolean> {
        const sector = await this.sectorsRepository.findOneOrFail(id);

        return this.sectorsRepository.remove(sector).then(() => true)
    }
}
