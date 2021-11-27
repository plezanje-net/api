import { Args, Int, Resolver, Query } from '@nestjs/graphql';
import { Image } from '../entities/image.entity';
import { ImagesService } from '../services/images.service';

@Resolver(of => Image)
export class ImagesResolver {
  constructor(private imagesService: ImagesService) {}

  @Query(returns => [Image], { name: 'latestImages' })
  latestImages(@Args('latest', { type: () => Int }) latest: number) {
    return this.imagesService.getLatestImages(latest);
  }
}
