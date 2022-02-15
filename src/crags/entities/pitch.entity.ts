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

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @Field(() => Route)
  route: Promise<Route>;
  @Column({ name: 'routeId' })
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
  @Field()
  height: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;
}
