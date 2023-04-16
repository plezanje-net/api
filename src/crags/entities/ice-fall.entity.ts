import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  Unique,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Comment } from './comment.entity';
import { Image } from '../../crags/entities/image.entity';
import { Area } from './area.entity';
import { Country } from './country.entity';
import { GradingSystem } from './grading-system.entity';
import { Book } from './book.entity';

@Entity()
@Unique(['slug'])
@ObjectType()
export class IceFall extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  slug: string;

  @Column({ nullable: true })
  @Field()
  grade: string;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  difficulty: number;

  @ManyToOne(() => GradingSystem, { nullable: true })
  @Field(() => GradingSystem, { nullable: true })
  defaultGradingSystem: Promise<GradingSystem>;

  @Column({ type: 'int', nullable: true })
  @Field()
  height: number;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ type: 'int' })
  position: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @ManyToOne(() => Country, (country) => country.iceFalls)
  @Field(() => Country)
  country: Promise<Country>;
  @Column()
  countryId: string;

  @ManyToOne(() => Area, (area) => area.iceFalls, { nullable: true })
  @Field(() => Area, { nullable: true })
  area: Promise<Area>;

  @OneToMany(() => Comment, (comment) => comment.iceFall, { nullable: true })
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(() => Image, (image) => image.iceFall, { nullable: true })
  @Field(() => [Image])
  images: Promise<Image[]>;

  @ManyToMany(() => Book)
  @JoinTable()
  books: Book[];
}
