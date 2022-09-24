import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Route } from './route.entity';

@Entity()
@ObjectType()
export class StarRatingVote extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'integer' })
  @Field()
  stars: number;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column()
  userId: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @ManyToOne(
    () => Route,
    route => route.starRatingVotes,
    { onDelete: 'CASCADE' },
  )
  @Field(type => Route)
  route: Promise<Route>;
  @Column()
  routeId: string;
}
