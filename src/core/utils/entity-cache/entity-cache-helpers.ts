import { BaseEntity, SelectQueryBuilder } from 'typeorm';
import crypto from 'crypto';

function setBuilderCache(builder: SelectQueryBuilder<BaseEntity>): void {
  const tables = builder.expressionMap.aliases
    .map(alias => `:${alias.metadata.tableName}:`)
    .join('');

  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(builder.getQueryAndParameters()))
    .digest('hex');
  builder.cache(tables + hash);
}

export { setBuilderCache };
