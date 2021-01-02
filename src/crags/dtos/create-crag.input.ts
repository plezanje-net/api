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
    long: number;

    @Field()
    countryId: string;

    @Field({ nullable: true })
    areaId: string;
}