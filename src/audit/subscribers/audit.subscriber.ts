import {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  Connection,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { InjectConnection } from '@nestjs/typeorm';
import { AuditInput } from '../interfaces/audit-input.interface';

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private auditService: AuditService,
  ) {
    connection.subscribers.push(this);
  }

  public entities: string[] = ['Country', 'Crag', 'User'];

  afterInsert(event: InsertEvent<any>): void {
    this.logEvent({
      entity: event.metadata.targetName,
      entityId: event.entity.id,
      action: 'insert',
      dataAfter: event.entity,
    });
  }

  afterUpdate(event: UpdateEvent<any>): void {
    this.logEvent({
      entity: event.metadata.targetName,
      entityId: event.entity.id,
      action: 'update',
      dataBefore: event.databaseEntity,
      dataAfter: event.entity,
    });
  }

  afterRemove(event: RemoveEvent<any>): void {
    this.logEvent({
      entity: event.metadata.targetName,
      entityId: event.entity.id,
      action: 'remove',
      dataBefore: event.entity,
    });
  }

  logEvent(data: AuditInput): void {
    if (this.entities.indexOf(data.entity) > -1) {
      this.auditService.create(data);
    }
  }
}
