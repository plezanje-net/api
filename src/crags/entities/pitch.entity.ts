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
import { Route } from './route.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@ObjectType()
export class Pitch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @Field(() => Route)
  route: Promise<Route>;
  @Column({ name: 'route_id' })
  routeId: string;

  @Column({ type: 'int' })
  @Field()
  number: number;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  difficulty: number;

  @Column({ default: false })
  @Field()
  isProject: boolean;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  height: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'user_id', nullable: true })
  userId: string;
}
