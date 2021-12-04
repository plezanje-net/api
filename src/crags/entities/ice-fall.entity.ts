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
import { Comment } from './comment.entity';
import { Image } from '../../crags/entities/image.entity';
import { Area } from './area.entity';
import { Country } from './country.entity';

@Entity()
@ObjectType()
export class IceFall extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  difficulty: string;

  @Column({ type: 'int', nullable: true })
  @Field()
  height: number;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  access: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ type: 'int' })
  position: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => Country,
    country => country.iceFalls,
  )
  @Field(() => Country)
  country: Promise<Country>;

  @ManyToOne(
    () => Area,
    area => area.iceFalls,
    { nullable: true },
  )
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @OneToMany(
    () => Comment,
    comment => comment.iceFall,
    { nullable: true },
  )
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(
    () => Image,
    image => image.iceFall,
    { nullable: true },
  )
  @Field(() => [Image])
  images: Promise<Image[]>;
}
