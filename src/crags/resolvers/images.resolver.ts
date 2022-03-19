import { UseGuards } from '@nestjs/common';
import { Args, Int, Resolver, Query } from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { CragStatus } from '../entities/crag.entity';
import { Image } from '../entities/image.entity';
import { ImagesService } from '../services/images.service';

@Resolver(of => Image)
export class ImagesResolver {
  constructor(private imagesService: ImagesService) {}

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query(returns => [Image], { name: 'latestImages' })
  latestImages(
    @Args('latest', { type: () => Int }) latest: number,
    @MinCragStatus() minStatus: CragStatus,
  ) {
    return this.imagesService.getLatestImages(latest, minStatus);
  }
}
