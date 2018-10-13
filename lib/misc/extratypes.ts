export type TokenEntry = {
    address: string,
    asset: string,
    asset_longname: string | null,
    normalized_quantity: number,
    quantity: number,
    owner: boolean
};

export interface TokenAddrMap {
    [key: string]: TokenEntry[];
}

export type PromiseOrNot<T> = T | Promise<T>;
