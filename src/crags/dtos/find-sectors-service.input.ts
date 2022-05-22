import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class FindSectorsServiceInput {
  @Field({ nullable: true })
  @IsOptional()
  minStatus?: EntityStatus;

  @Field({ nullable: true })
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  showPrivate?: boolean;
}
