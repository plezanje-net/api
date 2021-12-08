import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus } from '../entities/crag.entity';
import { RouteType } from '../entities/route.entity';

@InputType()
export class FindCragsInput {
  @Field({ nullable: true })
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  area?: string;

  @Field({ nullable: true })
  @IsOptional()
  minStatus?: CragStatus;

  @Field({ nullable: true })
  @IsOptional()
  routeType?: RouteType;

  @Field({ nullable: true })
  @IsOptional()
  allowEmpty?: boolean;
}
