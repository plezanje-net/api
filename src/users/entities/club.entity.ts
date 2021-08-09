import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { ClubMember } from './club-member.entity';

@Entity()
@ObjectType()
export class Club extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true }) // TODO: clean DB
  @Field()
  name: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @Column({ nullable: true })
  @Field()
  legacy: string;

  @OneToMany(
    type => ClubMember,
    clubMember => clubMember.club,
  )
  @Field(type => [ClubMember])
  members: ClubMember[];

  @Field({ nullable: true })
  nrMembers: number;
}
