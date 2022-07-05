import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { PublishStatus } from '../entities/enums/publish-status.enum';

@InputType()
export class CreateSectorInput {
  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  position: number;

  @Field()
  publishStatus: PublishStatus;

  @IsUUID()
  @Field()
  cragId: string;
}
