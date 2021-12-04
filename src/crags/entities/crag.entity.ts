import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Country } from './country.entity';
import { Sector } from './sector.entity';
import { Area } from './area.entity';
import { Book } from './book.entity';
import { Comment } from './comment.entity';
import { Image } from '../../crags/entities/image.entity';
import { Peak } from './peak.entity';
import { Route } from './route.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum CragStatus {
  PUBLIC = 'public',
  HIDDEN = 'hidden',
  ADMIN = 'admin',
  ARCHIVE = 'archive',
  PROPOSAL = 'proposal',
  USER = 'user',
}

@Entity()
@ObjectType()
export class Crag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  slug: string;

  @Column({
    type: 'enum',
    enum: CragStatus,
    default: CragStatus.PUBLIC,
  })
  @Field()
  status: CragStatus;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  lon: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  orientation: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  access: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Area,
    area => area.crags,
    { nullable: true },
  )
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @ManyToOne(
    () => Peak,
    peak => peak.crags,
    { nullable: true },
  )
  @Field(() => Peak, { nullable: true })
  peak: Promise<Peak>;

  @ManyToOne(
    () => Country,
    country => country.crags,
  )
  @Field(() => Country)
  country: Promise<Country>;

  @OneToMany(
    () => Sector,
    sector => sector.crag,
    { nullable: true },
  )
  @Field(() => [Sector])
  sectors: Promise<Sector[]>;

  @OneToMany(
    () => Route,
    route => route.crag,
    { nullable: true },
  )
  @Field(() => [Route])
  routes: Promise<Route[]>;

  @Column({ default: 0 })
  @Field(() => Int)
  nrRoutes: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  minGrade: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  maxGrade: string;

  @ManyToMany(() => Book)
  @JoinTable()
  books: Book[];

  @OneToMany(
    () => Comment,
    comment => comment.crag,
    { nullable: true },
  )
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(
    () => Image,
    image => image.crag,
    { nullable: true },
  )
  @Field(() => [Image])
  images: Promise<Image[]>;

  routeCount: number;

  @OneToMany(
    () => Activity,
    activity => activity.crag,
    { nullable: true },
  )
  @Field(() => [Activity])
  activities: Promise<Activity[]>;
}
