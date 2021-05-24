import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field()
  length: string;

  @Field()
  author: string;

  @Field()
  position: number;

  @Field()
  status: number;

  @IsUUID()
  @Field()
  sectorId: string;
}
