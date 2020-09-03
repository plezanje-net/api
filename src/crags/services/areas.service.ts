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
        private areasRepostory: Repository<Area>,
        @InjectRepository(Country)
        private countryRepository: Repository<Country>
    ) { }

    findOneById(id: string): Promise<Area> {
        return this.areasRepostory.findOneOrFail(id);
    }

    find(): Promise<Area[]> {
        return this.areasRepostory.find({ order: { name: 'ASC' } });
    }

    async create(data: CreateAreaInput): Promise<Area> {
        const area = new Area

        this.areasRepostory.merge(area, data);

        area.country = Promise.resolve(await this.countryRepository.findOneOrFail(data.countryId))

        return this.areasRepostory.save(area)
    }

    async update(data: UpdateAreaInput): Promise<Area> {
        const area = await this.areasRepostory.findOneOrFail(data.id);

        this.areasRepostory.merge(area, data);

        area.country = Promise.resolve(await this.countryRepository.findOneOrFail(data.countryId))

        return this.areasRepostory.save(area)
    }

    async delete(id: string): Promise<boolean> {
        const area = await this.areasRepostory.findOneOrFail(id);

        return this.areasRepostory.remove(area).then(() => true)
    }
}
