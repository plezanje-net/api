import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from 'src/core/interfaces/order-by-input.interface';
import { ActivityType } from '../entities/activity.entity';

@InputType()
export class FindActivitiesInput {
  @Field({ nullable: true })
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  cragId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  type?: ActivityType[];

  @Field({ nullable: true })
  @IsOptional()
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  dateTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageNumber?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageSize?: number;
}
