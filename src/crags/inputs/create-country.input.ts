import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateCountryInput {
    @Field()
    code: string;
  
    @Field()
    name: string;
  
    @Field()
    slug: string;
}