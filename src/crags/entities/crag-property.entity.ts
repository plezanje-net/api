import { Entity, Column, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseProperty } from './base-property.entity';
import { Crag } from './crag.entity';

@Entity()
@ObjectType()
export class CragProperty extends BaseProperty {
  @ManyToOne(() => Crag, { onDelete: 'CASCADE' })
  @Field(() => Crag)
  crag: Promise<Crag>;
  @Column()
  cragId: string;
}
