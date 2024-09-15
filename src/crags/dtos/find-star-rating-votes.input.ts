import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class FindStarRatingVotesInput {
  @Field({ nullable: true })
  @IsOptional()
  userId?: string;
}
