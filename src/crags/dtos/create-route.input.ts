import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';
import { PublishStatus } from '../entities/enums/publish-status.enum';

@InputType()
export class CreateRouteInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  length: number;

  @Field({ nullable: true })
  @IsOptional()
  author: string;

  @Field()
  position: number;

  @Field()
  publishStatus: PublishStatus;

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

  @Field({ nullable: true })
  @IsOptional()
  description: string;
}
