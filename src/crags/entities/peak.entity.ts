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
import { Area } from './area.entity';
import { Book } from './book.entity';
import { Comment } from './comment.entity';
import { Image } from '../../crags/entities/image.entity';
import { Crag } from './crag.entity';

@Entity()
@ObjectType()
export class Peak extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  lon: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Area,
    area => area.peaks,
    { nullable: true },
  )
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @ManyToOne(
    () => Country,
    country => country.peaks,
  )
  @Field(() => Country)
  country: Promise<Country>;

  @ManyToMany(() => Book)
  @JoinTable()
  books: Book[];

  @OneToMany(
    () => Crag,
    crag => crag.peak,
    { nullable: true },
  )
  @Field(() => [Crag])
  crags: Promise<Crag[]>;

  @OneToMany(
    () => Comment,
    comment => comment.peak,
    { nullable: true },
  )
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(
    () => Image,
    image => image.peak,
    { nullable: true },
  )
  @Field(() => [Image])
  images: Promise<Image[]>;
}
