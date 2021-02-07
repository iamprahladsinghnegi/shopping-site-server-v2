import { IInvetory } from "./inventory";

export interface IItem {
    url: string;
    name: string;
    category: string;
    subCategory: string;
}


export interface ItemObject extends IItem {
    inventory: IInvetory
}