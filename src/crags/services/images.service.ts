import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from '../dtos/create-image.dto';
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

  // TODO: add current user to params.
  async createImage(createImageDto: CreateImageDto): Promise<Image> {
    const {
      path,
      extension,
      aspectRatio,
      maxIntrinsicWidth,
      type,
      title,
      description,
    } = createImageDto;
    const image = this.imagesRepository.create({
      path,
      extension,
      aspectRatio,
      maxIntrinsicWidth,
      type,
      title,
      description,
    });
    if (createImageDto.route) {
      image.route = Promise.resolve(createImageDto.route);
    }
    if (createImageDto.crag) {
      image.crag = Promise.resolve(createImageDto.crag);
    }
    await this.imagesRepository.save(image);
    return image;
  }
}
