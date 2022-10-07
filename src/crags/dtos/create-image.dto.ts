import { Crag } from '../entities/crag.entity';
import { ImageType } from '../entities/image.entity';
import { Route } from '../entities/route.entity';

export class CreateImageDto {
  path: string;
  extension: string;
  aspectRatio: number;
  maxIntrinsicWidth: number;
  route?: Route;
  crag?: Crag;
  type?: ImageType;
  title?: string;
  description?: string;
}
