import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteEvent } from '../entities/route-event.entity';

@Injectable()
export class RouteEventsService {
  constructor(
    @InjectRepository(RouteEvent)
    private routeEventsRepository: Repository<RouteEvent>,
  ) {}

  async deleteMany(routeEvents: RouteEvent[]) {
    return this.routeEventsRepository.remove(routeEvents);
  }
}
