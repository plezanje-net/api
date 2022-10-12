import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class FindCommentsInput {
  @Field({ nullable: true })
  @IsOptional()
  cragId?: string;

  @Field({ nullable: true })
  @IsOptional()
  routeId?: string;

  @Field(type => [String], { nullable: true })
  @IsOptional()
  routeIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  pageNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  pageSize?: number;
}
