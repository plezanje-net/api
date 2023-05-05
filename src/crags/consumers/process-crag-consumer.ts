import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CragsService } from '../services/crags.service';

interface ProcessCragData {
  cragId: string;
}

@Processor('process-crag')
export class ProcessCragConsumer {
  constructor(private cragsService: CragsService) {}

  @Process()
  async transcode(job: Job<ProcessCragData>) {
    const crag = await this.cragsService.findOneById(job.data.cragId);

    crag.activityByMonth = await this.cragsService.getActivityByMonth(crag);

    await crag.save();

    return {};
  }
}
