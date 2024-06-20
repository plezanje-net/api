import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from '../../core/interfaces/order-by-input.interface';
import { PublishType } from '../entities/activity-route.entity';
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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  activityTypes?: string[];

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

  // We might need to fetch only activities that have at least some routes with specified publish type
  @Field(() => [String], { nullable: true })
  @IsOptional()
  hasRoutesWithPublish?: PublishType[];
}
