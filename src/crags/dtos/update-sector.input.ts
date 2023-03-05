import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PublishStatus } from '../entities/enums/publish-status.enum';

@InputType()
export class UpdateSectorInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

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
  cascadePublishStatus: boolean;

  @Field({ nullable: true })
  @IsOptional()
  rejectionMessage: string;
}
