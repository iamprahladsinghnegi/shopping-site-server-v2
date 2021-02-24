import { Schema } from 'mongoose';
export const CategorySchema: Schema = new Schema({
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    subCategoryRefs: [{ type: Schema.Types.ObjectId, ref: 'subCategories' }]
});


export const SubCategorySchema: Schema = new Schema({
    subCategoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    itemRefs: [{ type: Schema.Types.ObjectId, ref: 'items' }]
});
