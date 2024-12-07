import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class MoveRoutesToSectorInput {
  @Field((type) => [String])
  ids: string[];

  @Field()
  sectorId: string;
}
