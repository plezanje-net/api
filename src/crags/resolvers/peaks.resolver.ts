import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { FindCragsServiceInput } from '../dtos/find-crags-service.input';
import { Crag } from '../entities/crag.entity';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { Peak } from '../entities/peak.entity';
import { CragsService } from '../services/crags.service';
import { PeaksService } from '../services/peaks.service';

@Resolver(of => Peak)
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
      allowEmpty: true,
    });
  }
}
