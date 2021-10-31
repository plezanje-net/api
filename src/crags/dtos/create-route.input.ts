import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { RouteStatus } from '../entities/route.entity';

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field()
  length: string;

  @Field()
  author: string;

  @Field()
  position: number;

  @Field()
  status: RouteStatus;

  @IsUUID()
  @Field()
  sectorId: string;
}
