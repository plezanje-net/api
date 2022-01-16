import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';
import { Club } from './club.entity';

export enum ClubMemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
}
@Entity()
@Unique(['user', 'club'])
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
    type => User,
    user => user.clubs,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @Field(type => User)
  user: Promise<User>;

  @ManyToOne(
    type => Club,
    club => club.members,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @Field(type => Club)
  club: Promise<Club>;

  @Column({ nullable: true })
  confirmationToken: string;

  @Column({
    type: 'enum',
    enum: ClubMemberStatus,
    default: ClubMemberStatus.PENDING,
  })
  @Field()
  status: ClubMemberStatus;
}
