import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class UpdateRouteInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  length: string;

  @Field({ nullable: true })
  @IsOptional()
  author: string;

  @Field({ nullable: true })
  @IsOptional()
  label: string;

  @Field({ nullable: true })
  @IsOptional()
  position: number;

  @Field({ nullable: true })
  @IsOptional()
  status: EntityStatus;

  @Field({ nullable: true })
  @IsOptional()
  sectorId: string;

  @Field({ nullable: true })
  @IsOptional()
  routeTypeId: string;

  @Field({ nullable: true })
  @IsOptional()
  defaultGradingSystemId: string;
}
