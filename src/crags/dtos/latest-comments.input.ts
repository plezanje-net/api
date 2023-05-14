import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class LatestCommentsInput {
  @Field({ nullable: true })
  @IsOptional()
  pageNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  pageSize?: number;
}
