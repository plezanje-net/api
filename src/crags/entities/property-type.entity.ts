import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

export enum PropertyValueType {
  STRING = 'string',
  TEXT = 'text',
  URL = 'url',
  NUMBER = 'number',
  TIME = 'time',
  BOOLEAN = 'boolean',
}

@Entity()
@ObjectType()
export class PropertyType extends BaseEntity {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  valueType: PropertyValueType;

  @Column({ type: 'int' })
  position: number;
}
