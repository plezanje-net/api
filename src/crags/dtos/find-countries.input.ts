import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { OrderByInput } from 'src/core/interfaces/order-by-input.interface';

@InputType()
export class FindCountriesInput {
  @Field({ nullable: true })
  @IsOptional()
  hasCrags?: boolean;

  @Field()
  @IsOptional()
  orderBy?: OrderByInput;
}
