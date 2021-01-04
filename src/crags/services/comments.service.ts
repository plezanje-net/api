import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Crag } from '../entities/crag.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
        @InjectRepository(Crag)
        private cragsRepository: Repository<Crag>,
    ) { }

    findByCragAndType(cragId: string, type: string): Promise<Comment[]> {
        return this.commentsRepository.find({
            where: {
                crag: cragId,
                type: type,
            },
            order: { created: 'DESC' } 
        });
    }
}
