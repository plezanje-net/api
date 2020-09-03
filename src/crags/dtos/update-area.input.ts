import { InputType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class UpdateAreaInput {
    @Field()
    id: string;

    @Field({ nullable: true })
    @IsOptional()
    name?: string;

    @Field()
    @IsOptional()
    countryId: string;
}