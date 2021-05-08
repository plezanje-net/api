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
import { User } from './user.entity';
import { ClubMember } from './club-member.entity';

@Entity()
@ObjectType()
export class Club extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
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
    () => ClubMember,
    member => member.club,
  )
  @Field(type => [ClubMember])
  members: ClubMember[];
}
