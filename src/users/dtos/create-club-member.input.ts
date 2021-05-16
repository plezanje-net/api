import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateClubMemberInput {
  @Field()
  admin: boolean;

  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsUUID()
  clubId: string;
}
