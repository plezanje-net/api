import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateAreaInput {
    @Field()
    name: string;

    @Field()
    countryId: string;
}