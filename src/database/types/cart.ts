import { ItemDocument } from "../model/item.model";

export interface ICart {
    item: ItemDocument['_id'];
    itemId: string;
    quantity: number;
}