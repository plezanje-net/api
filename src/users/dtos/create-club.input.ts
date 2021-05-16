import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateClubInput {
  @Field()
  name: string;
}
