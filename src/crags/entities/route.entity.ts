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
import { Sector } from './sector.entity';
import { DifficultyVote } from './difficulty-vote.entity';
import { Comment } from './comment.entity';
import { Pitch } from './pitch.entity';
import { Image } from './image.entity';
import { Crag } from './crag.entity';
import { Rating } from './rating.entity';
import { GradingSystem } from './grading-system.entity';
import { RouteType } from './route-type.entity';

export enum RouteStatus {
  PUBLIC = 'public',
  HIDDEN = 'hidden',
  ADMIN = 'admin',
  ARCHIVE = 'archive',
  PROPOSAL = 'proposal',
  USER = 'user',
}

@Entity()
@ObjectType()
export class Route extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => RouteType)
  @Field(() => RouteType)
  routeType: Promise<RouteType>;
  @Column({ name: 'routeTypeId' })
  routeTypeId: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  difficulty: number;

  @ManyToOne(() => GradingSystem, { nullable: true })
  @Field(() => GradingSystem, { nullable: true })
  defaultGradingSystem: Promise<GradingSystem>;

  @Column({ type: 'int', nullable: true })
  @Field()
  length: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  author: string;

  @Column({ type: 'int' })
  position: number;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.PUBLIC,
  })
  @Field()
  status: RouteStatus;

  @Column({ default: false })
  @Field()
  isProject: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Crag,
    crag => crag.routes,
  )
  @Field(() => Crag)
  crag: Promise<Crag>;

  @ManyToOne(
    () => Sector,
    sector => sector.routes,
  )
  @Field(() => Sector)
  sector: Promise<Sector>;

  @Column({ name: 'sectorId' })
  sectorId: string;

  @OneToMany(
    () => DifficultyVote,
    difficultyVote => difficultyVote.route,
    { nullable: true },
  )
  @Field(() => [DifficultyVote])
  difficultyVotes: Promise<DifficultyVote[]>;

  @OneToMany(
    () => Rating,
    rating => rating.route,
    { nullable: true },
  )
  @Field(() => [Rating])
  ratings: Promise<Rating[]>;

  @OneToMany(
    () => Pitch,
    pitch => pitch.route,
    { nullable: true },
  )
  @Field(() => [Pitch])
  pitches: Promise<Pitch[]>;

  @OneToMany(
    () => Comment,
    comment => comment.route,
    { nullable: true },
  )
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(
    () => Image,
    image => image.route,
    { nullable: true },
  )
  @Field(() => [Image])
  images: Promise<Image[]>;
}
