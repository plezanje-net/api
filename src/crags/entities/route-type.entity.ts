import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { GradingSystem } from './grading-system.entity';
@Entity()
@ObjectType()
export class RouteType extends BaseEntity {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @ManyToMany(() => GradingSystem)
  @JoinTable({
    name: "grading_system_route_type"
  })
  gradingSystems: GradingSystem[];

  @Column({ type: 'int' })
  position: number;
}
