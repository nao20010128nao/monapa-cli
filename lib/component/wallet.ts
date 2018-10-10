import { ECPair } from "bitcoinjs-lib";
import { SaveData } from "../misc/wallethelper";

type OwnAddressState = "false" | "pubkey" | "privatekey";

export default interface Wallet {
    available(): boolean;
    load(params: SaveData): void;
    toJSON(): SaveData;
    ownAddress(address: string): OwnAddressState;
    getPair(address: string): ECPair;
    addAddress(pair: ECPair): void;
    listAddresses(): string[];
    getClassId(): string;
}