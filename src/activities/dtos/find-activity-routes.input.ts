import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from '../../core/interfaces/order-by-input.interface';
import { AscentType, PublishType } from '../entities/activity-route.entity';

@InputType()
export class FindActivityRoutesInput {
  @Field({ nullable: true })
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  cragId?: string;

  @Field({ nullable: true })
  @IsOptional()
  routeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  dateTo?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  ascentType?: AscentType[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  publish?: PublishType[];

  @Field({ nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageNumber?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageSize?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  clubId?: string;
}
