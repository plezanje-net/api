import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCragInput } from './inputs/create-crag.input';
import { Crag } from './entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCragInput } from './inputs/update-crag.input';
import { Country } from 'src/countries/entities/country.entity';

@Injectable()
export class CragsService {
    constructor(
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>
    ) { }

    find(params: any): Promise<Crag[]> {
        return this.cragsRepository.find(params);
    }

    async create(data: CreateCragInput): Promise<Crag> {
        const crag = new Crag

        this.cragsRepository.merge(crag, data);

        crag.country = await this.countryRepository.findOne(data.countryId)

        return this.cragsRepository.save(crag)
    }

    async update(data: UpdateCragInput): Promise<Crag> {
        const crag = await this.cragsRepository.findOne(data.id);

        if (crag == undefined) {
            throw NotFoundException
        }

        this.cragsRepository.merge(crag, data);

        return this.cragsRepository.save(crag)
    }

    async delete(id: string) {
        const crag = await this.cragsRepository.findOne(id);

        if (crag == undefined) {
            throw NotFoundException
        }

        return this.cragsRepository.remove(crag).then(() => true)
    }
}
