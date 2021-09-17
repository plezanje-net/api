import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from 'src/core/interfaces/order-by-input.interface';
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
  minStatus?: number;

  @Field({ nullable: true })
  @IsOptional()
  routeType?: RouteType;
}
