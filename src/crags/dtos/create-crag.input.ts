import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragType } from '../entities/crag.entity';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class CreateCragInput {
  @Field()
  name: string;

  @Field()
  type: CragType;

  @Field()
  status: EntityStatus;

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

  @Field()
  defaultGradingSystemId: string;
}
