import { BaseEntity, SelectQueryBuilder } from 'typeorm';
import crypto from 'crypto';

function setBuilderCache(
  builder: SelectQueryBuilder<BaseEntity>,
  method = 'getMany',
): void {
  const tables = builder.expressionMap.aliases
    .map(alias => `:${alias.metadata.tableName}:`)
    .join('');

  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify({ ...builder.getQueryAndParameters(), method }))
    .digest('hex');
  builder.cache(tables + hash);
}

export { setBuilderCache };
