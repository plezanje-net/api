import { UseInterceptors } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DataLoaderInterceptor } from '../../core/interceptors/data-loader.interceptor';
import { User } from '../../users/entities/user.entity';
import { FindCragsServiceInput } from '../dtos/find-crags-service.input';
import { Crag } from '../entities/crag.entity';
import { Peak } from '../entities/peak.entity';
import { CragsService } from '../services/crags.service';
import { PeaksService } from '../services/peaks.service';

@Resolver(of => Peak)
@UseInterceptors(DataLoaderInterceptor)
export class PeaksResolver {
  constructor(
    private peaksService: PeaksService,
    private cragsService: CragsService,
  ) {}

  @Query(returns => Peak, { name: 'peak' })
  async getPeak(@Args('slug') slug: string): Promise<Peak> {
    return this.peaksService.getPeak(slug);
  }

  @ResolveField('nrCrags', returns => Number)
  async getNumberOfCrags(@Parent() peak: Peak) {
    return this.peaksService.nrCragsInPeak(peak.id);
  }

  @ResolveField('crags', returns => [Crag])
  async getCrags(
    @CurrentUser() user: User,
    @Parent() peak: Peak,
    @Args('input', { nullable: true }) input: FindCragsServiceInput = {},
  ): Promise<Crag[]> {
    return this.cragsService.find({
      ...input,
      peakId: peak.id,
      user,
    });
  }
}
