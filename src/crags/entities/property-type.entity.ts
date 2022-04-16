import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { RouteType } from './route-type.entity';
import { Grade } from './grade.entity';

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
