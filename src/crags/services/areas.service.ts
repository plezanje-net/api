import { Injectable } from '@nestjs/common';
import { Area } from '../entities/area.entity';
import { CreateAreaInput } from '../dtos/create-area.input';
import { UpdateAreaInput } from '../dtos/update-area.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';

@Injectable()
export class AreasService {
    constructor(
        @InjectRepository(Area)
        private areasRepository: Repository<Area>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>
    ) { }

    findOneById(id: string): Promise<Area> {
        return this.areasRepository.findOneOrFail(id);
    }

    find(): Promise<Area[]> {
        return this.areasRepository.find({ order: { name: 'ASC' } });
    }

    async create(data: CreateAreaInput): Promise<Area> {
        const area = new Area

        this.areasRepository.merge(area, data);

        area.country = Promise.resolve(await this.countryRepository.findOneOrFail(data.countryId))

        return this.areasRepository.save(area)
    }

    async update(data: UpdateAreaInput): Promise<Area> {
        const area = await this.areasRepository.findOneOrFail(data.id);

        this.areasRepository.merge(area, data);

        area.country = Promise.resolve(await this.countryRepository.findOneOrFail(data.countryId))

        return this.areasRepository.save(area)
    }

    async delete(id: string): Promise<boolean> {
        const area = await this.areasRepository.findOneOrFail(id);

        return this.areasRepository.remove(area).then(() => true)
    }
}
