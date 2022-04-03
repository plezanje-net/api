import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class UpdateActivityInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  date: Date;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  duration: number;

  @Field({ nullable: true })
  @IsOptional()
  notes: string;

  @Field({ nullable: true })
  @IsOptional()
  partners: string;
}
