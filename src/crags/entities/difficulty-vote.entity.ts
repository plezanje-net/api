import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Route } from './route.entity';

/**
 * Has Triggers:
 *  - route_difficulty_vote
 */
@Entity()
@Unique(['route', 'user'])
@Index(['created'])
@ObjectType()
export class DifficultyVote extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'float' })
  @Field()
  difficulty: number;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @ManyToOne(() => Route, (route) => route.difficultyVotes, {
    onDelete: 'CASCADE',
  })
  @Field(() => Route)
  route: Promise<Route>;
  @Column()
  routeId: string;

  @Column({ nullable: true })
  @Field()
  includedInCalculation: boolean;

  @Column({ default: false })
  @Field()
  isBase: boolean;
}
