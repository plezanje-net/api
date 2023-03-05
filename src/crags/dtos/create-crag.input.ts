import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragType } from '../entities/crag.entity';
import { PublishStatus } from '../entities/enums/publish-status.enum';

@InputType()
export class CreateCragInput {
  @Field()
  name: string;

  @Field()
  type: CragType;

  @Field()
  publishStatus: PublishStatus;

  @Field()
  isHidden: boolean;

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
