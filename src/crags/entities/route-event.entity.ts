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
@ObjectType()
export class RouteEvent extends BaseEntity {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  author: string;

  @ManyToOne(() => Route, (route) => route.routeEvents, { onDelete: 'CASCADE' })
  route: Promise<Route>;

  // this can be converted to enum when we start actually using this entity
  @Column({ nullable: true })
  @Field({ nullable: true })
  eventType: string;

  @Column()
  @Field({ nullable: true })
  eventDate: Date;

  @ManyToOne(() => User)
  user: Promise<User>;

  @Column({ default: true })
  @Field({ nullable: true })
  showFullDate: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;
}
