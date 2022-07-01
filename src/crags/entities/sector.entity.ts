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
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from './enums/entity-status.enum';
import { PublishStatus } from './enums/publish-status.enum';

@Entity()
@ObjectType()
export class Sector extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  label: string;

  @Column({ type: 'int' })
  @Field()
  position: number;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.PUBLIC,
  })
  @Field()
  status: EntityStatus;

  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.PUBLISHED,
  })
  @Field()
  publishStatus: PublishStatus;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true })
  legacy: string;

  @Field()
  bouldersOnly: boolean;

  @ManyToOne(
    () => Crag,
    crag => crag.sectors,
    { nullable: false },
  )
  @Field(() => Crag)
  crag: Promise<Crag>;
  @Column({ name: 'cragId' })
  cragId: string;

  @OneToMany(
    () => Route,
    route => route.sector,
    { nullable: true, cascade: true },
  )
  @Field(() => [Route])
  routes: Promise<Route[]>;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'userId', nullable: true })
  userId: string;
}
