import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';
import { RouteStatus } from '../entities/route.entity';

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  length: string;

  @Field({ nullable: true })
  @IsOptional()
  author: string;

  @Field()
  position: number;

  @Field()
  status: RouteStatus;

  @IsUUID()
  @Field()
  sectorId: string;

  @Field()
  isProject: boolean;

  @Field()
  routeTypeId: string;

  @Field()
  defaultGradingSystemId: string;

  @Field({ nullable: true })
  @IsOptional()
  baseDifficulty: number;
}
