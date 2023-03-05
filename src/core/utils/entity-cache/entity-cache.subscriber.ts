import {
  DataSource,
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

  private async clearCache(dataSource: DataSource, tableName: string) {
    if (dataSource.queryResultCache) {
      const client = dataSource.queryResultCache['client'];
      const keys = await client.keys(`*:${tableName}:*`);
      if (keys.length > 0) await client.del(keys);
    }
  }
}
