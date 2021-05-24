import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class ConfirmInput {
  @IsUUID()
  @Field()
  id: string;

  @Field()
  token: string;
}
