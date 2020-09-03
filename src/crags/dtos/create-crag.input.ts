import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateCragInput {
    @Field()
    name: string;

    @Field()
    slug: string;

    @Field()
    status: number;

    @Field()
    lat: number;

    @Field()
    lang: number;

    @Field()
    countryId: string;

    @Field({ nullable: true })
    areaId: string;
}