import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateClubMemberByEmailInput {
  @Field()
  admin: boolean;

  @Field()
  userEmail: string;

  @Field()
  @IsUUID()
  clubId: string;
}
