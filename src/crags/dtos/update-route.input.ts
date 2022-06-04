import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PublishStatus } from '../entities/enums/publish-status.enum';

@InputType()
export class UpdateRouteInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  length: number;

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
  publishStatus: PublishStatus;

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
