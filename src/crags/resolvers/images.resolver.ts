import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Int,
  Resolver,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import { User } from '../../users/entities/user.entity';
import { Image } from '../entities/image.entity';
import { ImagesService } from '../services/images.service';
import { UserLoader } from '../../users/loaders/user.loader';
import DataLoader from 'dataloader';

@Resolver(() => Image)
@UseInterceptors(DataLoaderInterceptor)
export class ImagesResolver {
  constructor(private imagesService: ImagesService) {}

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query((returns) => [Image], { name: 'latestImages' })
  latestImages(
    @Args('latest', { type: () => Int }) latest: number,
    @CurrentUser() user: User,
  ) {
    return this.imagesService.getLatestImages(latest, user != null);
  }

  @ResolveField('user', () => User, { nullable: true })
  async getUser(
    @Parent() image: Image,
    @Loader(UserLoader)
    loader: DataLoader<Image['userId'], User>,
  ): Promise<User> {
    return image.userId ? loader.load(image.userId) : null;
  }
}
