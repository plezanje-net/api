import { Injectable } from '@nestjs/common';
import { CreateCragInput } from '../dtos/create-crag.input';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCragInput } from '../dtos/update-crag.input';
import { Country } from 'src/crags/entities/country.entity';

@Injectable()
export class CragsService {
    constructor(
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>
    ) { }

    findOneById(id: string): Promise<Crag> {
        return this.cragsRepository.findOneOrFail(id);
    }

    find(params: { country?: any }): Promise<Crag[]> {
        return this.cragsRepository.find(params);
    }

    async create(data: CreateCragInput): Promise<Crag> {
        const crag = new Crag

        this.cragsRepository.merge(crag, data);

        crag.country = await this.countryRepository.findOneOrFail(data.countryId)

        return this.cragsRepository.save(crag)
    }

    async update(data: UpdateCragInput): Promise<Crag> {
        const crag = await this.cragsRepository.findOneOrFail(data.id);

        this.cragsRepository.merge(crag, data);

        return this.cragsRepository.save(crag)
    }

    async delete(id: string): Promise<boolean> {
        const crag = await this.cragsRepository.findOneOrFail(id);

        return this.cragsRepository.remove(crag).then(() => true)
    }
}
