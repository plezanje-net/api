import { Injectable } from '@nestjs/common';
import { CreateCragInput } from './inputs/create-crag.input';
import { Crag } from './entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CragsService {
    constructor(
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>
    ) { }

    create(data: CreateCragInput): Promise<Crag> {
        const crag = new Crag

        this.cragsRepository.merge(crag, data);

        return this.cragsRepository.save(crag)
    }
}
