import { InputType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { OrderByInput } from "src/core/interfaces/order-by-input.interface";

@InputType()
export class FindAreasInput {
    @Field({ nullable: true })
    @IsOptional()
    hasCrags?: boolean;

    @Field()
    @IsOptional()
    orderBy?: OrderByInput;

    @Field({ nullable: true })
    @IsOptional()
    countryId?: string;
}