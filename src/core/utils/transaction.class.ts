import { Connection, QueryRunner } from 'typeorm';

export class Transaction {
  connection: Connection;

  queryRunner: QueryRunner;

  constructor(connection: Connection) {
    this.queryRunner = connection.createQueryRunner();
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
  }

  public async commit() {
    await this.queryRunner.commitTransaction();
  }
}
