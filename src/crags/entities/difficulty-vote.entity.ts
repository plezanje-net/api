import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Route } from './route.entity';

@Entity()
@Unique(['route', 'user'])
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

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Route,
    route => route.difficultyVotes,
  )
  @Field(() => Route)
  route: Promise<Route>;

  @Column({ nullable: true })
  @Field()
  includedInCalculation: boolean;

  @Column({ nullable: true })
  @Field()
  isBase: boolean;
}
