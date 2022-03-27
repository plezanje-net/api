import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PublishType } from '../entities/activity-route.entity';

@InputType()
export class UpdateActivityRouteInput {
  @Field()
  id: string;

  // @Field() enable after validation is bullet proof
  // ascentType: AscentType;

  @Field({ nullable: true })
  @IsOptional()
  publish: PublishType;

  // @Field() enable after you validate activity relation
  // date: Date;

  @Field({ nullable: true })
  @IsOptional()
  notes: string;

  @Field({ nullable: true })
  @IsOptional()
  partner: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  position: number;
}
