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
import { Activity } from '../../activities/entities/activity.entity';
import { Comment } from '../../crags/entities/comment.entity';
import { Crag } from '../../crags/entities/crag.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { Route } from '../../crags/entities/route.entity';
import { RouteEvent } from '../../crags/entities/route-event.entity';
import { DifficultyVote } from '../../crags/entities/difficulty-vote.entity';

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

  @Column({ nullable: true, select: false })
  legacy: string;

  @OneToMany((type) => ClubMember, (clubMember) => clubMember.user)
  clubs: Promise<ClubMember[]>;

  // All of the images that the user contributed
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

  @OneToMany(() => Activity, (activity) => activity.user)
  @Field(() => [Activity])
  activities: Promise<Activity[]>;

  @OneToMany(() => Comment, (comment) => comment.user)
  @Field(() => [Comment])
  comments: Promise<Comment[]>;

  @OneToMany(() => Crag, (crag) => crag.user)
  @Field(() => [Crag])
  crags: Promise<Crag[]>;

  @OneToMany(() => Sector, (sector) => sector.user)
  @Field(() => [Sector])
  sectors: Promise<Sector[]>;

  @OneToMany(() => Route, (route) => route.user)
  @Field(() => [Route])
  routes: Promise<Route[]>;

  @OneToMany(() => RouteEvent, (routeEvent) => routeEvent.user)
  @Field(() => [RouteEvent])
  routeEvents: Promise<RouteEvent[]>;

  @OneToMany(() => DifficultyVote, (difficultyVote) => difficultyVote.user)
  @Field(() => [DifficultyVote])
  difficultyVotes: Promise<DifficultyVote[]>;
}
