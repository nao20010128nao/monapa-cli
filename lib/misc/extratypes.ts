export type TokenEntry = {
    address: string,
    asset: string,
    asset_longname: string | null,
    normalized_quantity: number,
    quantity: number,
    owner: boolean
};

export interface TypedObject<V> {
    [key: string]: V;
}

export type TokenAddrMap = TypedObject<TokenEntry[]>

export type PromiseOrNot<T> = T | Promise<T>;

export type DataLike = string | Buffer | NodeJS.TypedArray | DataView;