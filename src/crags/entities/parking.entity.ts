import { Field, Float, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sector } from './sector.entity';

@Entity()
@ObjectType()
export class Parking extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'float' })
  @Field(() => Float)
  lat: number;

  @Column({ type: 'float' })
  @Field(() => Float)
  lon: number;

  @ManyToMany(() => Sector, (sector) => sector.parkings, {
    onDelete: 'CASCADE',
  })
  sectors: Sector[];
}
