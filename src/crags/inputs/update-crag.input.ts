import { InputType, Field } from "@nestjs/graphql";
@InputType()
export class UpdateCragInput {
    @Field()
    id: string;

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
}