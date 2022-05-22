import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  length: string;

  @Field({ nullable: true })
  @IsOptional()
  author: string;

  @Field()
  position: number;

  @Field()
  status: EntityStatus;

  @IsUUID()
  @Field()
  sectorId: string;

  @Field()
  isProject: boolean;

  @Field()
  routeTypeId: string;

  @Field()
  defaultGradingSystemId: string;

  @Field({ nullable: true })
  @IsOptional()
  baseDifficulty: number;
}
