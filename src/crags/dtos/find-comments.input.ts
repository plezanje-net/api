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

  @Field({ nullable: true })
  @IsOptional()
  type?: string;
}
