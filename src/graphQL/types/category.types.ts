import { ObjectType, Field, } from "type-graphql";

@ObjectType()
export class CategoryAndSubCategory {
    @Field(() => String)
    category: string;

    @Field(() => [String]!)
    subCategory: string[];
}


@ObjectType()
export class SubCategoryWithCategoryResponse {
    @Field(() => String)
    category: string;

    @Field(() => String)
    subCategory: string;

    @Field(() => String)
    image: string;
}
