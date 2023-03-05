import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { DataLoaderInterceptor } from '../../core/interceptors/data-loader.interceptor';
import { IceFallProperty } from '../entities/ice-fall-property.entity';
import { IceFall } from '../entities/ice-fall.entity';
import { NotFoundFilter } from '../filters/not-found.filter';
import { EntityPropertiesService } from '../services/entity-properties.service';
import { IceFallsService } from '../services/ice-falls.service';

@Resolver(() => IceFall)
@UseInterceptors(DataLoaderInterceptor)
export class IceFallsResolver {
  constructor(
    private iceFallsService: IceFallsService,
    private entityPropertiesService: EntityPropertiesService,
  ) {}

  @Query(() => IceFall)
  @UseFilters(NotFoundFilter)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  async iceFallBySlug(@Args('slug') slug: string): Promise<IceFall> {
    return this.iceFallsService.findOneBySlug(slug);
  }

  @ResolveField('properties', () => [IceFallProperty])
  async getProperties(@Parent() iceFall: IceFall): Promise<IceFallProperty[]> {
    return this.entityPropertiesService.getIceFallProperties(iceFall);
  }
}
