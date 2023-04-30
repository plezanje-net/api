import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('process-crag')
export class ProcessCragConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    console.log('Processing crag', job.data);
    return {};
  }
}
