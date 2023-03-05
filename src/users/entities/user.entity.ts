import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Extensions } from '@nestjs/graphql';
import { Role } from './role.entity';
import { Image } from '../../crags/entities/image.entity';
import { ClubMember } from './club-member.entity';
import { checkRoleMiddleware } from '../../core/middleware/check-role.middleware';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field({ middleware: [checkRoleMiddleware], nullable: true })
  @Extensions({ roles: ['admin', 'self'] })
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
  @Field({ nullable: true })
  gender?: string;

  @OneToMany(() => Role, (role) => role.user)
  @Field(() => [Role], { middleware: [checkRoleMiddleware], nullable: true })
  @Extensions({ roles: ['admin', 'self'] })
  roles: Promise<Role[]>;

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

  @Column({ default: false })
  @Field()
  hasUnpublishedContributions: boolean;

  @Column({ nullable: true })
  lastPasswordChange: Date;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @OneToMany((type) => ClubMember, (clubMember) => clubMember.user)
  clubs: ClubMember[];

  // All of thr images that the user contributed
  @OneToMany(() => Image, (image) => image.user)
  @Field(() => [Image])
  images: Promise<Image[]>;

  // Profile image for the user
  @OneToOne((type) => Image, { nullable: true })
  @JoinColumn()
  @Field((type) => Image, { nullable: true })
  profileImage: Promise<Image[]>;

  isAdmin = async () => {
    const roles = await this.roles;
    return roles ? roles.some((r) => r.role == 'admin') : false;
  };
}
