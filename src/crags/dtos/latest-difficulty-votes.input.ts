import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class LatestDifficultyVotesInput {
  @Field({ nullable: true })
  @IsOptional()
  cragId?: string;

  @Field({ nullable: true })
  @IsOptional()
  routeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  forUserId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageNumber?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  pageSize?: number;
}
