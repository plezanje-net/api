import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CragsService } from '../services/crags.service';
import { RoutesService } from '../services/routes.service';
import { Crag } from '../entities/crag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from '../entities/route.entity';
import { Repository } from 'typeorm';

interface SummaryQueueData {
  cragId?: string;
  routeId?: string;
}

@Processor('summary')
export class SummaryQueueConsumer {
  constructor(
    private cragsService: CragsService,
    private routesService: RoutesService,
    @InjectRepository(Crag)
    protected cragRepository: Repository<Crag>,
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
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

    await this.cragRepository.update(crag.id, {
      activityByMonth: await this.cragsService.getActivityByMonth(crag),
    });
  }

  async processRoute(routeId: string) {
    const route = await this.routesService.findOneById(routeId);

    await this.routesRepository.update(route.id, {
      nrClimbers: await this.routesService.countDisctinctClimbers(route),
      nrTicks: await this.routesService.countTicks(route),
      nrTries: await this.routesService.countTries(route),
    });
  }
}
