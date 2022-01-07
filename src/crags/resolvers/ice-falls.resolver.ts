import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { IceFall } from '../entities/ice-fall.entity';
import { NotFoundFilter } from '../filters/not-found.filter';
import { IceFallsService } from '../services/ice-falls.service';

@Resolver()
export class IceFallsResolver {
  constructor(private iceFallsService: IceFallsService) {}

  @Query(() => IceFall)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async iceFallBySlug(@Args('slug') slug: string): Promise<IceFall> {
    return this.iceFallsService.findOneBySlug(slug);
  }
}
