import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateClubInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
