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
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { Country } from './country.entity';
import { Sector } from './sector.entity';
import { Area } from './area.entity';
import { Book } from './book.entity';
import { Comment } from './comment.entity';
import { Image } from '../../crags/entities/image.entity';
import { Peak } from './peak.entity';
import { Route } from './route.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { GradingSystem } from './grading-system.entity';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from './enums/entity-status.enum';
import { PublishStatus } from './enums/publish-status.enum';

export enum CragType {
  SPORT = 'sport',
  ALPINE = 'alpine',
}

export enum Orientation {
  NORTH = 'north',
  NORTHEAST = 'northeast',
  EAST = 'east',
  SOUTHEAST = 'southeast',
  SOUTH = 'south',
  SOUTHWEST = 'southwest',
  WEST = 'west',
  NORTHWEST = 'northwest',
}
registerEnumType(Orientation, {
  name: 'Orientation',
});

export enum WallAngle {
  SLAB = 'slab',
  VERTICAL = 'vertical',
  OVERHANG = 'overhang',
  ROOF = 'roof',
}
registerEnumType(WallAngle, {
  name: 'WallAngle',
});

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}
registerEnumType(Season, {
  name: 'Season',
});

@Entity()
@Index(['publishStatus'])
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
    enum: CragType,
    default: CragType.SPORT,
  })
  @Field()
  type: CragType;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.PUBLIC,
  })
  @Field()
  status: EntityStatus;

  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.PUBLISHED,
  })
  @Field()
  publishStatus: PublishStatus;

  @Column({ default: false })
  @Field()
  isHidden: boolean;

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
  @Field()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @ManyToOne(() => Area, (area) => area.crags, { nullable: true })
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;
  @Column({ nullable: true })
  areaId: string;

  @ManyToOne(() => Peak, (peak) => peak.crags, { nullable: true })
  @Field(() => Peak, { nullable: true })
  peak: Promise<Peak>;
  @Column({ nullable: true })
  peakId: string;

  @ManyToOne(() => Country, (country) => country.crags)
  @Field(() => Country)
  country: Promise<Country>;
  @Column({ nullable: true })
  countryId: string;

  @OneToMany(() => Sector, (sector) => sector.crag, { nullable: true })
  @Field(() => [Sector])
  sectors: Promise<Sector[]>;

  @OneToMany(() => Route, (route) => route.crag, { nullable: true })
  @Field(() => [Route])
  routes: Promise<Route[]>;

  @ManyToOne(() => GradingSystem)
  @Field(() => GradingSystem, { nullable: true })
  defaultGradingSystem: Promise<GradingSystem>;
  @Column({ nullable: true })
  defaultGradingSystemId: string;

  @Column({ default: 0 })
  @Field(() => Int)
  nrRoutes: number;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  minDifficulty: number;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  maxDifficulty: number;

  @ManyToMany(() => Book)
  @JoinTable()
  books: Book[];

  @OneToMany(() => Comment, (comment) => comment.crag, { nullable: true })
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(() => Image, (image) => image.crag, { nullable: true })
  @Field(() => [Image])
  images: Promise<Image[]>;

  routeCount: number;

  @OneToMany(() => Activity, (activity) => activity.crag, {
    nullable: true,
  })
  activities: Promise<Activity[]>;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'int',
    array: true,
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  })
  @Field(() => [Int])
  activityByMonth: number[];

  @Column({
    type: 'enum',
    enum: Orientation,
    array: true,
    nullable: true,
  })
  @Field(() => [Orientation], { nullable: true })
  orientations: Orientation[];

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  approachTime: number;

  @Column({
    type: 'enum',
    enum: WallAngle,
    array: true,
    nullable: true,
  })
  @Field(() => [WallAngle], { nullable: true })
  wallAngles: WallAngle[];

  @Column({
    type: 'enum',
    enum: Season,
    array: true,
    nullable: true,
  })
  @Field(() => [Season], { nullable: true })
  seasons: Season[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  rainProof: boolean;

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  @Field(() => Image, { nullable: true })
  coverImage: Promise<Image>;
}
