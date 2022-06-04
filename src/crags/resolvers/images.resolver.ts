import { UseGuards } from '@nestjs/common';
import { Args, Int, Resolver, Query } from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { User } from '../../users/entities/user.entity';
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
    @CurrentUser() user: User,
  ) {
    return this.imagesService.getLatestImages(latest, user != null);
  }
}
