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
  id: string;

  @Column()
  @Field()
  admin: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @ManyToOne(
    () => User,
    user => user.clubs,
    { nullable: false },
  )
  user: User;

  @ManyToOne(
    () => Club,
    club => club.members,
    { nullable: false },
  )
  club: Club;
}
