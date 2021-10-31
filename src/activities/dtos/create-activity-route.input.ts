import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { AscentType, PublishType } from '../entities/activity-route.entity';

@InputType()
export class CreateActivityRouteInput {
  @Field()
  name: string;

  @Field()
  ascentType: AscentType;

  @Field()
  publish: PublishType;

  @Field()
  date: Date;

  @Field({ nullable: true })
  @IsOptional()
  notes: string;

  @Field({ nullable: true })
  @IsOptional()
  partner: string;

  @Field({ nullable: true })
  @IsOptional()
  routeId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  position: number;

  @Field({ nullable: true })
  @IsOptional()
  grade: number;

  @Field({ nullable: true })
  @IsOptional()
  difficulty: string;

  @Field({ nullable: true })
  @IsOptional()
  stars: number;
}
