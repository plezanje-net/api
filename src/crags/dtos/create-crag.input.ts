import { InputType, Field } from '@nestjs/graphql';
import { CragStatus } from '../entities/crag.entity';

@InputType()
export class CreateCragInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  status: CragStatus;

  @Field()
  lat: number;

  @Field()
  lon: number;

  @Field()
  countryId: string;

  @Field({ nullable: true })
  areaId: string;
}
