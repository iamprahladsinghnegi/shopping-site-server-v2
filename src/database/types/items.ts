export interface IItem {
    itemId: string;
    name: string;
    category: string;
    subCategory: string;
    brand: string;
    images: Array<string>;
    description: IItemDescription;
}

export interface IItemDescription {
    details: string;
    size: string;
    fit: string;
    materials: string;
    care: string;
}