import { CreateClubInput } from './create-club.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateClubInput extends PartialType(CreateClubInput) {
  @Field(() => Int)
  id: number;
}
