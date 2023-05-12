import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Area } from './area.entity';
import { Peak } from './peak.entity';
import { IceFall } from './ice-fall.entity';

@Entity()
@ObjectType()
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  code: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  slug: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @OneToMany(() => Crag, (crag) => crag.country, { nullable: true })
  @Field(() => [Crag])
  crags: Promise<Crag[]>;

  @OneToMany(() => Area, (area) => area.country, { nullable: true })
  @Field(() => [Area])
  areas: Promise<Area[]>;

  @OneToMany(() => Peak, (peak) => peak.country, { nullable: true })
  @Field(() => [Peak])
  peaks: Promise<Peak[]>;

  @Field((type) => Int)
  nrPeaks: number;

  @OneToMany(() => IceFall, (iceFall) => iceFall.country, { nullable: true })
  @Field(() => [IceFall])
  iceFalls: Promise<IceFall[]>;

  @Column({ default: 0 })
  @Field(() => Int)
  nrCrags: number;
}
