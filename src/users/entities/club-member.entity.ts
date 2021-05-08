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
import { User } from './user.entity';
import { Club } from './club.entity';

@Entity()
@ObjectType()
export class ClubMember extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  admin: boolean;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @Column({ nullable: true })
  @Field()
  legacy: string;

  @ManyToOne(
    () => User,
    user => user.clubs,
    { nullable: false },
  )
  @Field(type => User)
  user: Promise<User>;

  @ManyToOne(
    () => Club,
    club => club.members,
    { nullable: false },
  )
  @Field(type => Club)
  club: Promise<Club>;
}
