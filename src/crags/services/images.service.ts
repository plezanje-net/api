import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UploadImageDto } from '../dtos/upload-image.dto';
import { Crag } from '../entities/crag.entity';
import { Image, sizes } from '../entities/image.entity';
import { Route } from '../entities/route.entity';
import { CragsService } from './crags.service';
import { RoutesService } from './routes.service';
import sharp from 'sharp';
import path from 'path';
import { env } from 'process';
import * as fs from 'fs';

export class ImagesService {
  maxSize = { width: 6000, height: 6000 };
  targetSizes = sizes;

  constructor(
    @InjectRepository(Image) private imagesRepository: Repository<Image>,
    private routesService: RoutesService,
    private cragsService: CragsService,
  ) {}

  async findOneByPath(path: string): Promise<Image> {
    return this.imagesRepository.findOneBy({ path });
  }

  async findOneById(id: string): Promise<Image> {
    return this.imagesRepository.findOneBy({ id });
  }

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
      .orderBy('i.created', 'DESC')
      .limit(latest);

    if (!showHiddenCrags) {
      builder.andWhere('c.isHidden = false');
    }

    return builder.getMany();
  }

  async createImage(
    uploadImageDto: UploadImageDto,
    imageFile: Express.Multer.File,
    currentUser: User,
  ) {
    const { entityType, entityId, author, title, description } = uploadImageDto;
    const inputExtension = path.extname(imageFile.originalname);
    let crag: Crag;
    let stemBase: string;
    let parentEntity: Route | Crag;
    switch (entityType) {
      case 'route':
        const route = await this.routesService.findOneById(entityId);
        crag = await route.crag;
        stemBase = crag.slug + '-' + route.slug;
        parentEntity = route;
        break;
      case 'crag':
        crag = await this.cragsService.findOneById(entityId);
        stemBase = crag.slug;
        parentEntity = crag;
        break;
      // Add other cases when/if adding support for other entity types
    }
    const stem = await this.generateUniqueStem(entityType, stemBase);

    // Resize image, generate other image sizes, save to disk and retreive some image data needed for FE
    const { maxIntrinsicWidth, aspectRatio } = await this.processImage(
      imageFile.buffer,
      stem,
      inputExtension,
      entityType,
    );

    // Save image info to db
    const image = this.imagesRepository.create({
      path: `${entityType}s/${stem}`,
      extension: inputExtension,
      aspectRatio,
      maxIntrinsicWidth,
      author,
      title,
      description,
    });

    // image.crag or image.route ...
    image[<string>entityType] = Promise.resolve(parentEntity);

    image.user = Promise.resolve(currentUser);

    await this.imagesRepository.save(image);

    return image;
  }

  async deleteImage(id: string): Promise<Boolean> {
    try {
      const image = await this.imagesRepository.findOneOrFail({
        where: {
          id,
        },
      });

      this.targetSizes.forEach((size) => {
        fs.rm(
          `${env.STORAGE_PATH}/images/${image.path}.jpg`,
          this.handleImageRemove,
        );
        fs.rm(
          `${env.STORAGE_PATH}/images/${size}/${image.path}.webp`,
          this.handleImageRemove,
        );
        fs.rm(
          `${env.STORAGE_PATH}/images/${size}/${image.path}.avif`,
          this.handleImageRemove,
        );
        fs.rm(
          `${env.STORAGE_PATH}/images/${size}/${image.path}.jpg`,
          this.handleImageRemove,
        );
      });

      await this.imagesRepository.remove(image);

      return true;
    } catch (error) {
      // TODO log to Sentry when we have it on the API
      return false;
    }
  }

  private async generateUniqueStem(entity: string, stemBase: string) {
    let counter = 0;
    let stem = stemBase;

    while (await this.findOneByPath(`${entity}s/${stem}`)) {
      counter++;
      stem = `${stemBase}-${counter}`;
    }
    return stem;
  }

  private async processImage(
    imageBuffer: Buffer,
    stem: string,
    extension: string,
    entity: string,
  ) {
    // Load image from buffer
    const shImage = await sharp(imageBuffer);

    const { width, height } = await shImage
      .rotate() // dummy rotate, to 'flatten' the rotation metadata and switched width/height
      .resize({
        width: this.maxSize.width,
        height: this.maxSize.height,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(`${env.STORAGE_PATH}/images/${entity}s/${stem}${extension}`);

    // Determine aspect ratio after initial image resize. From that calculate also what the max width of the generated image variations will be
    const aspectRatio = width / height;
    const maxIntrinsicWidth = Math.round(
      Math.min(
        width,
        this.maxSize.width,
        this.maxSize.height * aspectRatio,
        Math.max(...this.targetSizes),
      ),
    );

    // Generate all of the predefined sizes and save them as webp, avif and jpeg
    await Promise.all(
      this.targetSizes.flatMap((size) => {
        // Resize image (only if big enough)
        const resizedImage = shImage.clone().resize({
          width: size,
          height: this.maxSize.height,
          fit: 'inside',
          withoutEnlargement: true,
        });

        // Convert to different formats, suitable for FE
        const webpImage = resizedImage.clone().toFormat('webp');
        const avifImage = resizedImage.clone().toFormat('avif');
        const jpegImage = resizedImage.clone().toFormat('jpeg', {
          quality: 80,
          chromaSubsampling: '4:4:4',
          mozjpeg: true,
        });

        // Save image of current size in all formats to disk
        return [
          jpegImage.toFile(
            `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.jpg`,
          ),
          webpImage.toFile(
            `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.webp`,
          ),
          avifImage.toFile(
            `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.avif`,
          ),
        ];
      }),
    );

    return { maxIntrinsicWidth, aspectRatio };
  }

  private handleImageRemove() {
    // TODO log to Sentry when we have it on the API
  }
}
