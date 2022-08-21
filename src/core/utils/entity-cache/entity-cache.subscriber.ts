import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export default class EntityCacheSubscriber
  implements EntitySubscriberInterface {
  async afterRemove(event: RemoveEvent<any>) {
    this.clearCache(event.connection, event.metadata.tableName);
  }

  async afterInsert(event: InsertEvent<any>) {
    this.clearCache(event.connection, event.metadata.tableName);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    this.clearCache(event.connection, event.metadata.tableName);
  }

  private async clearCache(connection: Connection, tableName: string) {
    if (connection.queryResultCache) {
      const client = connection.queryResultCache['client'];
      const keys = await client.keys(`*:${tableName}:*`);
      if (keys.length > 0) await client.del(keys);
    }
  }
}
