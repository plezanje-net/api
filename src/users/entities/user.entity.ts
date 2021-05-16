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
import { Role } from './role.entity';
import { ClubMember } from './club-member.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  @Field()
  firstname: string;

  @Column()
  @Field()
  lastname: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  www?: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  picture: string;

  @OneToMany(
    () => Role,
    role => role.user,
  )
  @Field(() => [Role])
  roles: Role[];

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  passwordToken: string;

  @Column({ nullable: true })
  confirmationToken: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @OneToMany(
    type => ClubMember,
    clubMember => clubMember.user,
  )
  @Field(() => [ClubMember])
  clubs: ClubMember[];
}
