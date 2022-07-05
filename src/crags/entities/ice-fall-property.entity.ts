import { Entity, Column, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseProperty } from './base-property.entity';
import { IceFall } from './ice-fall.entity';

@Entity()
@ObjectType()
export class IceFallProperty extends BaseProperty {
  @ManyToOne(() => IceFall)
  @Field(() => IceFall)
  iceFall: Promise<IceFall>;
  @Column()
  iceFallId: string;
}
