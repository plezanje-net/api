import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { EntityStatus } from './enums/entity-status.enum';
import { PublishStatus } from './enums/publish-status.enum';
import { Parking } from './parking.entity';

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

  @Column({ nullable: true, select: false })
  legacy: string;

  @Field()
  bouldersOnly: boolean;

  @ManyToOne(() => Crag, (crag) => crag.sectors, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Field(() => Crag)
  crag: Promise<Crag>;
  @Column({ name: 'crag_id' })
  cragId: string;

  @OneToMany(() => Route, (route) => route.sector, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [Route])
  routes: Promise<Route[]>;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: Promise<User>;
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToMany(() => Parking, (parking) => parking.sectors)
  @JoinTable()
  parkings: Parking[];
}
