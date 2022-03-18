import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CragStatus } from '../entities/crag.entity';
import { Image } from '../entities/image.entity';

export class ImagesService {
  constructor(
    @InjectRepository(Image) private imagesRepository: Repository<Image>,
  ) {}

  getLatestImages(latest: number, minStatus: CragStatus) {
    const builder = this.imagesRepository.createQueryBuilder('i');
    builder
      .leftJoin('route', 'r', 'i.routeId = r.id')
      .leftJoin('crag', 'c', 'c.id = COALESCE(i.cragId, r.cragId)')
      .where('c.status <= :minStatus', { minStatus })
      .andWhere('i.type = :type', { type: 'photo' }) // Comment this out if you want to show all types of images
      .orderBy('i.created', 'DESC')
      .limit(latest);

    return builder.getMany();
  }
}
