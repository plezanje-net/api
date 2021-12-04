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
import { Crag } from '../../crags/entities/crag.entity';
import { Area } from '../../crags/entities/area.entity';
import { Route } from '../../crags/entities/route.entity';
import { Comment } from '../../crags/entities/comment.entity';
import { Peak } from './peak.entity';
import { IceFall } from './ice-fall.entity';
import { User } from '../../users/entities/user.entity';

export enum ImageType {
  PHOTO = 'photo',
  SKETCH = 'sketch',
  MAP = 'map',
  PROFILE = 'profile',
}

@Entity()
@ObjectType()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.PHOTO,
  })
  type: ImageType;

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

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(
    () => User,
    user => user.images,
  )
  @Field(() => User, { nullable: true })
  user: Promise<User>;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Area,
    area => area.images,
    { nullable: true },
  )
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @ManyToOne(
    () => Crag,
    crag => crag.images,
    { nullable: true },
  )
  @Field(() => Crag, { nullable: true })
  crag: Promise<Crag>;

  @ManyToOne(
    () => Route,
    route => route.images,
    { nullable: true },
  )
  @Field(() => Route, { nullable: true })
  route: Promise<Route>;

  @ManyToOne(
    () => IceFall,
    iceFall => iceFall.images,
    { nullable: true },
  )
  @Field(() => IceFall, { nullable: true })
  iceFall: Promise<IceFall>;

  @ManyToOne(
    () => Comment,
    comment => comment.images,
    { nullable: true },
  )
  @Field(() => Comment, { nullable: true })
  comment: Promise<Comment>;

  @ManyToOne(
    () => Peak,
    peak => peak.images,
    { nullable: true },
  )
  @Field(() => Peak, { nullable: true })
  peak: Promise<Peak>;
}
