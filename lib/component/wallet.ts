import { ECPair } from "bitcoinjs-lib";

type OwnAddressState = "false" | "pubkey" | "privatekey";
type SaveData = { public: any, private: any };

export default interface Wallet {
    available(): boolean;
    load(params: SaveData): void;
    toJSON(): SaveData;
    ownAddress(address: string): OwnAddressState;
    getPair(address: string): ECPair;
    addAddress(pair: ECPair): void;
    listAddresses(): string[];
}