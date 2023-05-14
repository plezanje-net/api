import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  Unique,
  JoinTable,
  ManyToMany,
  Index,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Sector } from './sector.entity';
import { DifficultyVote } from './difficulty-vote.entity';
import { Comment } from './comment.entity';
import { Pitch } from './pitch.entity';
import { Image } from './image.entity';
import { Crag } from './crag.entity';
import { StarRatingVote } from './star-rating-vote.entity';
import { GradingSystem } from './grading-system.entity';
import { RouteType } from './route-type.entity';
import { RouteEvent } from './route-event.entity';
import { Book } from './book.entity';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from './enums/entity-status.enum';
import { ActivityRoute } from '../../activities/entities/activity-route.entity';
import { PublishStatus } from './enums/publish-status.enum';

/**
 * Has Triggers:
 *  - crag_min_max_route_difficulty
 *  - crag_route_count
 */
@Entity()
@Unique(['slug', 'crag'])
@Index(['publishStatus'])
@ObjectType()
export class Route extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => RouteType)
  @Field(() => RouteType)
  routeType: Promise<RouteType>;
  @Column()
  routeTypeId: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  slug: string;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  difficulty: number;

  @ManyToOne(() => GradingSystem)
  @Field(() => GradingSystem)
  defaultGradingSystem: Promise<GradingSystem>;
  @Column()
  defaultGradingSystemId: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  starRating: number;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  length: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  author: string;

  @Column({ type: 'int' })
  @Field()
  position: number;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.PUBLIC,
  })
  @Field()
  status: EntityStatus;

  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.PUBLISHED,
  })
  @Field()
  publishStatus: PublishStatus;

  @Column({ default: false })
  @Field()
  isProject: boolean;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @ManyToOne(() => Crag, (crag) => crag.routes, { onDelete: 'CASCADE' })
  @Field(() => Crag)
  crag: Promise<Crag>;
  @Column()
  cragId: string;

  @ManyToOne(() => Sector, (sector) => sector.routes, { onDelete: 'CASCADE' })
  @Field(() => Sector)
  sector: Promise<Sector>;
  @Column()
  sectorId: string;

  @OneToMany(() => DifficultyVote, (difficultyVote) => difficultyVote.route, {
    nullable: true,
  })
  @Field(() => [DifficultyVote])
  difficultyVotes: Promise<DifficultyVote[]>;

  @OneToMany(() => StarRatingVote, (starRatingVote) => starRatingVote.route, {
    nullable: true,
  })
  @Field((type) => [StarRatingVote])
  starRatingVotes: Promise<StarRatingVote[]>;

  @OneToMany(() => Pitch, (pitch) => pitch.route, { nullable: true })
  @Field(() => [Pitch])
  pitches: Promise<Pitch[]>;

  @OneToMany(() => Comment, (comment) => comment.route, { nullable: true })
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(() => Image, (image) => image.route, { nullable: true })
  @Field(() => [Image])
  images: Promise<Image[]>;

  @OneToMany(() => RouteEvent, (routeEvent) => routeEvent.route, {
    nullable: true,
  })
  @Field(() => [RouteEvent])
  routeEvents: Promise<RouteEvent[]>;

  @ManyToMany(() => Book)
  @JoinTable()
  books: Book[];

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @OneToMany(() => ActivityRoute, (activityRoute) => activityRoute.route)
  activityRoutes: ActivityRoute[];

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  nrTicks: number;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  nrTries: number;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  nrClimbers: number;
}
