import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class OrderByInput {
  @Field()
  field: string;

  @Field(() => String)
  @IsOptional()
  direction?: 'ASC' | 'DESC';
}
