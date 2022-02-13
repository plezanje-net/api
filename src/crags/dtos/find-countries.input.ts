import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from '../../core/interfaces/order-by-input.interface';

@InputType()
export class FindCountriesInput {
  @Field({ nullable: true })
  @IsOptional()
  hasCrags?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  hasPeaks?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  hasIceFalls?: boolean;

  @Field()
  @IsOptional()
  orderBy?: OrderByInput;
}
