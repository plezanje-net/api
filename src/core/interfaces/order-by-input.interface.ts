import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class OrderByInput {
  @Field()
  field: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  direction?: 'ASC' | 'DESC';
}
