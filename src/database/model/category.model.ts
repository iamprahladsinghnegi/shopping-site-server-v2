import mongoose, { Document } from "mongoose";
import { CategorySchema, SubCategorySchema } from "../schema/category";
import { ISubCategory, ICategory } from "../types/category";
import { ItemDocument } from "./item.model";

export interface SubCategoryDocument extends ISubCategory, Document {
    itemRefs: Array<ItemDocument['_id']>;
}
export const SubCategoryModel = mongoose.model<SubCategoryDocument>('subCategories', SubCategorySchema)

export interface CategoryDocument extends ICategory, Document {
    subCategoryRefs: Array<SubCategoryDocument['_id']>;
}
export const CategoryModel = mongoose.model<CategoryDocument>('categories', CategorySchema)