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

@Entity()
@ObjectType()
export class Pitch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Route, { nullable: false })
  @Field(() => Route)
  route: Promise<Route>;

  @Column({ type: 'int' })
  @Field()
  number: number;

  @Column({ nullable: true })
  @Field()
  difficulty: string;

  @Column({ type: 'int', nullable: true })
  @Field()
  height: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;
}
