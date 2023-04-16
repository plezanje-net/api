import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Area } from '../../crags/entities/area.entity';
import { Route } from '../../crags/entities/route.entity';
import { Comment } from '../../crags/entities/comment.entity';
import { Peak } from './peak.entity';
import { IceFall } from './ice-fall.entity';
import { User } from '../../users/entities/user.entity';

export enum ImageParentEntityType {
  CRAG = 'crag',
  ROUTE = 'route',
}

export const sizes = [300, 600, 1040]; // Add to this list if other sizes needed by FE (if changed, should reprocess all images)

@Entity()
@ObjectType()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column()
  @Field()
  path: string;

  @Column()
  @Field()
  extension: string;

  @Column({ type: 'float' })
  @Field((type) => Float)
  aspectRatio: number;

  @Column({ type: 'integer' })
  @Field((type) => Int)
  maxIntrinsicWidth: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  // The user that contributed the image
  @ManyToOne(() => User, (user) => user.images)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // The actual author of the photo/image
  @Column({ nullable: true })
  @Field({ nullable: true })
  author: string;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(() => Area, (area) => area.images, { nullable: true })
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @ManyToOne(() => Crag, (crag) => crag.images, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Crag, { nullable: true })
  crag: Promise<Crag>;

  @ManyToOne(() => Route, (route) => route.images, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Route, { nullable: true })
  route: Promise<Route>;

  @ManyToOne(() => IceFall, (iceFall) => iceFall.images, { nullable: true })
  @Field(() => IceFall, { nullable: true })
  iceFall: Promise<IceFall>;

  @ManyToOne(() => Comment, (comment) => comment.images, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Comment, { nullable: true })
  comment: Promise<Comment>;

  @ManyToOne(() => Peak, (peak) => peak.images, { nullable: true })
  @Field(() => Peak, { nullable: true })
  peak: Promise<Peak>;
}
