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
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { ActivityRoute } from './activity-route.entity';
import { User } from '../../users/entities/user.entity';
import { IceFall } from '../../crags/entities/ice-fall.entity';
import { Peak } from '../../crags/entities/peak.entity';

export enum ActivityType {
  CRAG = 'crag',
  CLIMBING_GYM = 'climbingGym',
  TRAINING_GYM = 'trainingGym',
  PEAK = 'peak',
  ICE_FALL = 'iceFall',
  OTHER = 'other',
}

@Entity()
@ObjectType()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Crag, { nullable: true })
  @Field(() => Crag, { nullable: true })
  crag: Promise<Crag>;

  @ManyToOne(() => IceFall, { nullable: true })
  @Field(() => IceFall, { nullable: true })
  iceFall: Promise<IceFall>;

  @ManyToOne(() => Peak, { nullable: true })
  @Field(() => Peak, { nullable: true })
  peak: Promise<Peak>;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.OTHER,
  })
  @Field()
  type: ActivityType;

  @Column({ nullable: true })
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  date: Date;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  duration: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  partners: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @OneToMany(
    () => ActivityRoute,
    route => route.activity,
    { nullable: true },
  )
  @Field(() => [ActivityRoute])
  routes: Promise<ActivityRoute[]>;

  @ManyToOne(() => User, { nullable: false })
  @Field(() => User)
  user: Promise<User>;
  @Column()
  userId: string;
}
