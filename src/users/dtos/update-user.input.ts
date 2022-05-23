import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  firstname?: string;

  @Field({ nullable: true })
  @IsOptional()
  lastname?: string;

  @Field({ nullable: true })
  @IsOptional()
  showPrivateEntries?: boolean;
}
