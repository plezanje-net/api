import { CreateClubInput } from './create-club.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateClubInput extends PartialType(CreateClubInput) {
  @Field()
  id: string;
}
