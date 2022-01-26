import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';

export enum SectorStatus {
  PUBLIC = 'public',
  HIDDEN = 'hidden',
  ADMIN = 'admin',
  ARCHIVE = 'archive',
  PROPOSAL = 'proposal',
  USER = 'user',
}

@Entity()
@ObjectType()
export class Sector extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  label: string;

  @Column({ type: 'int' })
  @Field()
  position: number;

  @Column({
    type: 'enum',
    enum: SectorStatus,
    default: SectorStatus.PUBLIC,
  })
  @Field()
  status: SectorStatus;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @Field()
  bouldersOnly: boolean;

  @ManyToOne(
    () => Crag,
    crag => crag.sectors,
    { nullable: false },
  )
  @Field(() => Crag)
  crag: Promise<Crag>;

  @OneToMany(
    () => Route,
    route => route.sector,
    { nullable: true, cascade: true },
  )
  @Field(() => [Route])
  routes: Promise<Route[]>;
}
