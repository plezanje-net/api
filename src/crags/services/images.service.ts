import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

export class ImagesService {
  constructor(
    @InjectRepository(Image) private imagesRepository: Repository<Image>,
  ) {}

  getLatestImages(latest: number, showHiddenCrags: boolean) {
    const builder = this.imagesRepository.createQueryBuilder('i');
    builder
      .leftJoin(
        'route',
        'r',
        "i.routeId = r.id AND r.publishStatus = 'published'",
      )
      .leftJoin(
        'crag',
        'c',
        "c.id = COALESCE(i.cragId, r.cragId) AND c.publishStatus = 'published'",
      )

      .andWhere("r.publishStatus = 'published'") // only show ticks for published routes
      .andWhere('i.type = :type', { type: 'photo' }) // Comment this out if you want to show all types of images
      .orderBy('i.created', 'DESC')
      .limit(latest);

    if (!showHiddenCrags) {
      builder.andWhere('c.isHidden = false');
    }

    return builder.getMany();
  }
}
