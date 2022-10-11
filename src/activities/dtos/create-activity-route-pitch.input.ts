import { InputType, Field, Int } from '@nestjs/graphql';
import { AscentType, PublishType } from '../entities/activity-route.entity';

@InputType()
export class CreateActivityRoutePitchInput {
  @Field()
  pitchId: string;

  @Field(() => Int)
  position: number;

  @Field()
  ascentType: AscentType;

  @Field()
  publish: PublishType;
}
