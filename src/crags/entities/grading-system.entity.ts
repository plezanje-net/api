import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { RouteType } from './route-type.entity';
import { Grade } from './grade.entity';
@Entity()
@ObjectType()
export class GradingSystem extends BaseEntity {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'int' })
  position: number;

  @ManyToMany(
    () => RouteType,
    routeType => routeType.gradingSystems,
    { nullable: true },
  )
  @Field(() => [RouteType])
  routeTypes: Promise<RouteType[]>;

  @OneToMany(
    () => Grade,
    grade => grade.gradingSystem,
  )
  @Field(() => [Grade])
  grades: Promise<Grade[]>;
}
