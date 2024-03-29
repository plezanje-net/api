import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  Index,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Route } from '../../crags/entities/route.entity';
import { Activity } from './activity.entity';
import { Pitch } from '../../crags/entities/pitch.entity';
import { User } from '../../users/entities/user.entity';

export enum AscentType {
  ONSIGHT = 'onsight',
  FLASH = 'flash',
  REDPOINT = 'redpoint',
  REPEAT = 'repeat',
  ALLFREE = 'allfree',
  AID = 'aid',
  ATTEMPT = 'attempt',
  T_ONSIGHT = 't_onsight',
  T_FLASH = 't_flash',
  T_REDPOINT = 't_redpoint',
  T_REPEAT = 't_repeat',
  T_ALLFREE = 't_allfree',
  T_AID = 't_aid',
  T_ATTEMPT = 't_attempt',
  TICK = 'tick',
}

export const tickAscentTypes = new Set([
  AscentType.ONSIGHT,
  AscentType.FLASH,
  AscentType.REDPOINT,
  AscentType.REPEAT,
]);

export const firstTickAscentTypes = new Set([
  AscentType.ONSIGHT,
  AscentType.FLASH,
  AscentType.REDPOINT,
]);

export const trTickAscentTypes = new Set([
  AscentType.T_ONSIGHT,
  AscentType.T_FLASH,
  AscentType.T_REDPOINT,
  AscentType.T_REPEAT,
]);

export const firstTrTickAscentTypes = new Set([
  AscentType.T_ONSIGHT,
  AscentType.T_FLASH,
  AscentType.T_REDPOINT,
]);

export enum PublishType {
  PUBLIC = 'public',
  CLUB = 'club',
  LOG = 'log',
  PRIVATE = 'private',
}

/**
 * Has Triggers:
 *  - convert_first_repeat_to_redpoint
 *  - delete_difficulty_vote
 */
@Entity()
@Index(['route', 'publish'])
@Index(['publish', 'activity'])
@ObjectType()
export class ActivityRoute extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  // TODO: if we decided that every activity route belongs to an activity, this can become non nullable
  @ManyToOne(() => Activity, (activity) => activity.routes, { nullable: true })
  @Field(() => Activity, { nullable: true })
  activity: Promise<Activity>;
  @Column({ nullable: true })
  activityId: string;

  @ManyToOne(() => Route)
  @Field(() => Route)
  route: Promise<Route>;
  @Column()
  @Field()
  routeId: string;

  @ManyToOne(() => Pitch, { nullable: true })
  @Field((type) => Pitch, { nullable: true })
  pitch: Promise<Route>;

  @Column({
    type: 'enum',
    enum: AscentType,
    default: AscentType.REDPOINT,
  })
  @Field()
  ascentType: AscentType;

  @Column({
    type: 'enum',
    enum: PublishType,
    default: PublishType.PRIVATE,
  })
  @Field()
  publish: PublishType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  partner: string;

  @Column({ nullable: true })
  position: number;

  @ManyToOne(() => User, { nullable: false })
  @Field(() => User)
  user: Promise<User>;
  @Column()
  userId: string;

  // A score for the activity route. It is used for ordering all ascents by difficulty, thus also scores ascent types such as attempt, allfree and all tr sub types (in contrast with rankingScore which only scores successfull (lead) ticks (all other ascents types get score 0)
  // It is a function of route's difficulty and ascent type.
  @Column({ type: 'float' })
  @Field()
  orderScore: number;

  // A score for the activity route. It is used for ranking user's ascents, thus scores all non-tick ascent types such as attempt, allfree and all tr sub types with 0
  // It is a function of route's difficulty and ascent type.
  @Column({ type: 'float' })
  @Field()
  rankingScore: number;
}
