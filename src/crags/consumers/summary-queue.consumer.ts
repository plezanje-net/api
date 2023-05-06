import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CragsService } from '../services/crags.service';
import { RoutesService } from '../services/routes.service';

interface SummaryQueueData {
  cragId?: string;
  routeId?: string;
}

@Processor('summary')
export class SummaryQueueConsumer {
  constructor(
    private cragsService: CragsService,
    private routesService: RoutesService,
  ) {}

  @Process()
  async transcode(job: Job<SummaryQueueData>) {
    if (job.data.cragId) {
      await this.processCrag(job.data.cragId);
    }

    if (job.data.routeId) {
      await this.processRoute(job.data.routeId);
    }
  }

  async processCrag(cragId: string) {
    const crag = await this.cragsService.findOneById(cragId);

    crag.activityByMonth = await this.cragsService.getActivityByMonth(crag);

    await crag.save();
  }

  async processRoute(routeId: string) {
    const route = await this.routesService.findOneById(routeId);

    route.nrClimbers = await this.routesService.countDisctinctClimbers(route);
    route.nrTicks = await this.routesService.countTicks(route);
    route.nrTries = await this.routesService.countTries(route);

    await route.save();
  }
}
