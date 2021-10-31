import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus } from '../entities/crag.entity';
@InputType()
export class UpdateCragInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  status: CragStatus;

  @Field({ nullable: true })
  @IsOptional()
  lat: number;

  @Field({ nullable: true })
  @IsOptional()
  lon: number;

  @Field({ nullable: true })
  @IsOptional()
  countryId: string;

  @Field({ nullable: true })
  @IsOptional()
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
