import { IsEnum, IsNotEmpty } from 'class-validator';
import { ImageParentEntityType } from '../entities/image.entity';

export class UploadImageDto {
  @IsNotEmpty()
  entityId: string;

  @IsNotEmpty()
  @IsEnum(ImageParentEntityType)
  entityType: ImageParentEntityType;

  title?: string;

  @IsNotEmpty()
  author: string;

  description?: string;
}
