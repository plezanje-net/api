import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';

@InputType()
export class CreateActivityInput {
  @Field()
  date: Date;

  @Field()
  name: string;

  @Field()
  type: ActivityType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  partners?: string;

  @Field({ nullable: true })
  @IsOptional()
  iceFallId?: string;

  @Field({ nullable: true })
  @IsOptional()
  cragId?: string;

  @Field({ nullable: true })
  @IsOptional()
  peakId?: string;
}
