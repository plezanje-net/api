import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Route } from './route.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RouteEvent extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  author: string;

  @ManyToOne(
    () => Route,
    route => route.routeEvents,
  )
  route: Promise<Route>;

  // this can be converted to enum when we start actually using this entity
  @Column({ nullable: true })
  eventType: string;

  @Column()
  eventDate: Date;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;

  @Column({ default: true })
  showFullDate: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;
}
