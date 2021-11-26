import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

export class ImagesService {
  constructor(
    @InjectRepository(Image) private imagesRepository: Repository<Image>,
  ) {}

  getLatestImages(latest: number) {
    return this.imagesRepository.find({
      order: {
        created: 'DESC',
      },
      take: latest,
    });
  }
}
