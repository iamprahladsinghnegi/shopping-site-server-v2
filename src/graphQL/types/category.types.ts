import { ObjectType, Field, } from "type-graphql";

@ObjectType()
export class CategoryAndSubCategory {
    @Field(() => String)
    category: string;

    @Field(() => [String]!)
    subCategory: string[];
}


