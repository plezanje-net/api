import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus } from '../entities/crag.entity';

@InputType()
export class CreateCragInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  status: CragStatus;

  @Field({ nullable: true })
  @IsOptional()
  lat: number;

  @Field({ nullable: true })
  @IsOptional()
  lon: number;

  @Field()
  countryId: string;

  @Field({ nullable: true })
  areaId: string;

  @Field({ nullable: true })
  @IsOptional()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  access: string;

  @Field({ nullable: true })
  @IsOptional()
  orientation: string;
}
