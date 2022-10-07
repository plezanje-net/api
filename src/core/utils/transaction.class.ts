import { DataSource, QueryRunner } from 'typeorm';

export class Transaction {
  dataSource: DataSource;

  queryRunner: QueryRunner;

  constructor(dataSource: DataSource) {
    this.queryRunner = dataSource.createQueryRunner();
  }

  public async start() {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  public async save(entity: any) {
    await this.queryRunner.manager.save(entity);
  }

  public async delete(entity: any) {
    await this.queryRunner.manager.remove(entity);
  }

  public async rollback() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }

  public async commit() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }
}
