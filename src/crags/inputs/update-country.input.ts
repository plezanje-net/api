import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class UpdateCountryInput {
    @Field()
    id: string;

    @Field()
    code: string;
  
    @Field()
    name: string;
  
    @Field()
    slug: string;
}