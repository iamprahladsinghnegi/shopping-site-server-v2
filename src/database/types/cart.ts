import { ItemDocument } from "../model/item.model";

export interface ICartItem {
    item: ItemDocument['_id'];
    itemId: string;
    quantity: number;
    size: string;
}

export interface ICart {
    cardId: string;
    items: Array<ICartItem>;
}