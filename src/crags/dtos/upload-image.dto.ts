import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ImageParentEntityType, ImageType } from '../entities/image.entity';

export class UploadImageDto {
  @IsNotEmpty()
  entityId: string;

  @IsNotEmpty()
  @IsEnum(ImageParentEntityType)
  entityType: ImageParentEntityType;

  title?: string;

  @IsOptional()
  @IsEnum(ImageType)
  type?: ImageType;

  description?: string;
}
