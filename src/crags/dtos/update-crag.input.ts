import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus, CragType } from '../entities/crag.entity';
@InputType()
export class UpdateCragInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field()
  @IsOptional()
  type: CragType;

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

  @Field({ nullable: true })
  @IsOptional()
  defaultGradingSystemId: string;
}
