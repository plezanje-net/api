import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import * as fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { env } from 'process';

import { RoutesService } from '../../services/routes.service';
import { ImagesService } from '../../services/images.service';
import { CragsService } from '../../services/crags.service';
import { Crag } from '../../entities/crag.entity';
import { CreateImageDto } from '../../dtos/create-image.dto';
import { Route } from '../../entities/route.entity';
import { ImageType, sizes } from '../../entities/image.entity';
import { NonGQLUserAuthGuard } from '../../../auth/guards/non-gql-user-auth.guard';
import { User } from '../../../users/entities/user.entity';
import { NonGqlCurrentUser } from '../../../auth/decorators/non-gql-current-user.decorator';

@Controller('upload')
@UseGuards(NonGQLUserAuthGuard)
export class UploadController {
  maxSize = { width: 6000, height: 6000 };
  targetSizes = sizes;

  constructor(
    private routesService: RoutesService,
    private cragsService: CragsService,
    private imagesService: ImagesService,
  ) {}

  @Post('image')
  async image(@NonGqlCurrentUser() currentUser: User, @Req() req, @Res() res) {
    try {
      if (!req.isMultipart()) {
        throw new BadRequestException();
      }

      // Get the image file and other form fields
      const data = await req.file();
      if (!data) {
        throw new BadRequestException();
      }

      // Required fields
      const entityType = data.fields.entityType?.value;
      const entityId = data.fields.entityId?.value;
      if (!entityType || !entityId) {
        throw new BadRequestException();
      }

      // Optional fields
      const type: ImageType = data.fields.type?.value;
      if (!(!type || Object.values(ImageType).includes(type))) {
        throw new BadRequestException();
      }
      const title = data.fields.title?.value;
      const description = data.fields.description?.value;

      const inputExtension = path.extname(data.filename);

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
        // Add other cases when adding support for other entity types
        default:
          throw new BadRequestException();
      }

      const stem = await this.generateUniqueStem(entityType, stemBase);

      // Load the image to memmory
      const imageBuffer = await data.toBuffer();

      // Resize image, generate other image sizes, save to disk and retreive some image data needed for FE
      const { maxIntrinsicWidth, aspectRatio } = await this.processImage(
        imageBuffer,
        stem,
        inputExtension,
        entityType,
      );

      // Save image info to db
      const createImageDto: CreateImageDto = {
        path: `${entityType}s/${stem}`,
        extension: inputExtension,
        aspectRatio,
        maxIntrinsicWidth,
        type,
        title,
        description,
      };
      createImageDto[entityType] = parentEntity;

      const image = await this.imagesService.createImage(
        createImageDto,
        currentUser,
      );

      res.code(201).send(image.id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private async generateUniqueStem(entity: string, stemBase: string) {
    let counter = 0;
    let stem = stemBase;

    while (await this.imagesService.findOneByPath(`${entity}s/${stem}`)) {
      counter++;
      stem = `${stemBase}-${counter}`;
    }
    return stem;
  }

  private async processImage(
    imageBuffer: string,
    stem: string,
    extension: string,
    entity: string,
  ) {
    // Load image from file
    const shImage = await sharp(imageBuffer);

    await shImage
      .resize({
        width: this.maxSize.width,
        height: this.maxSize.height,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(`${env.STORAGE_PATH}/images/${entity}s/${stem}${extension}`);

    // Generate all of the predefined sizes and save them as webp, avif and jpeg
    this.targetSizes.forEach(async size => {
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
      jpegImage.toFile(
        `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.jpg`,
      );
      webpImage.toFile(
        `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.webp`,
      );
      avifImage.toFile(
        `${env.STORAGE_PATH}/images/${size}/${entity}s/${stem}.avif`,
      );
    });

    // Aspect ratio can be determined from original image metadata, because it will not change. From that also actual max intrinsic width can be determined
    const { width, height } = await shImage.metadata();
    const aspectRatio = width / height;
    const maxIntrinsicWidth = Math.round(
      Math.min(
        width,
        this.maxSize.width,
        this.maxSize.height * aspectRatio,
        Math.max(...this.targetSizes),
      ),
    );

    return { maxIntrinsicWidth, aspectRatio };
  }
}
