import { Entity, Column, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseProperty } from './base-property.entity';
import { Route } from './route.entity';

@Entity()
@ObjectType()
export class RouteProperty extends BaseProperty {
  @ManyToOne(() => Route)
  @Field(() => Route)
  route: Promise<Route>;
  @Column()
  routeId: string;
}
