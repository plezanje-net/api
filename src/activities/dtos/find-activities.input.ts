import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { OrderByInput } from "src/core/interfaces/order-by-input.interface";

@InputType()
export class FindActivitiesInput {
    @Field({ nullable: true })
    @IsOptional()
    userId?: string;

    @Field({ nullable: true })
    @IsOptional()
    orderBy?: OrderByInput;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    pageNumber?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    pageSize?: number;
}