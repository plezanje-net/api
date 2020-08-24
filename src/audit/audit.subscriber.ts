import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, Repository, Connection } from "typeorm";
import { Injectable, } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { InjectConnection } from "@nestjs/typeorm";

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {

    constructor(
        @InjectConnection() readonly connection: Connection,
        private auditService: AuditService
    ) {
        connection.subscribers.push(this);
    }

    public entities: string[] = ['Country', 'Crag', 'User'];

    afterInsert(event: InsertEvent<any>) {
        this.logEvent({
            entity: event.metadata.targetName,
            entityId: event.entity.id,
            action: 'insert',
            dataAfter: event.entity
        });
    }

    afterUpdate(event: UpdateEvent<any>) {
        this.logEvent({
            entity: event.metadata.targetName,
            entityId: event.entity.id,
            action: 'update',
            dataBefore: event.databaseEntity,
            dataAfter: event.entity
        });
    }

    afterRemove(event: RemoveEvent<any>) {
        this.logEvent({
            entity: event.metadata.targetName,
            entityId: event.entity.id,
            action: 'remove',
            dataBefore: event.entity,
        });
    }

    logEvent(data: any): void {
        if (this.entities.indexOf(data.entity) > -1) {
            this.auditService.create(data);
        }
    }

}