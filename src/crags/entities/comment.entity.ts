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
import { Crag } from './crag.entity';
import { Route } from './route.entity';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../crags/entities/image.entity';
import { Peak } from './peak.entity';
import { IceFall } from './ice-fall.entity';

export enum CommentType {
  WARNING = 'warning',
  CONDITION = 'condition',
  DESCRIPTION = 'description',
  COMMENT = 'comment',
}

export enum CommentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({
    type: 'enum',
    enum: CommentType,
    default: CommentType.COMMENT,
  })
  @Field()
  type: CommentType;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.ACTIVE,
  })
  status: CommentStatus;

  @CreateDateColumn()
  @Field()
  created: Date;

  @Field()
  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(() => Crag, (crag) => crag.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Crag, { nullable: true })
  crag: Promise<Crag>;
  @Column({ nullable: true })
  cragId: string;

  @ManyToOne(() => Route, (route) => route.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Route, { nullable: true })
  route: Promise<Route>;

  @Column({ name: 'route_id', nullable: true })
  routeId: string;

  @Column({ nullable: true }) // keep nullable, only comments of type=warning use this field
  @Field({ nullable: true })
  exposedUntil: Date;

  @ManyToOne(() => IceFall, (iceFall) => iceFall.comments, { nullable: true })
  @Field(() => IceFall)
  iceFall: Promise<IceFall>;

  @ManyToOne(() => Peak, (peak) => peak.comments, { nullable: true })
  @Field(() => Peak)
  peak: Promise<Peak>;

  @OneToMany(() => Image, (image) => image.comment, { nullable: true })
  @Field(() => [Image])
  images: Promise<Image[]>;
}
