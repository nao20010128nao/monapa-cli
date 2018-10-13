import { ECPair } from "bitcoinjs-lib";
import { SaveData, OwnAddressState } from "../misc/wallethelper";

export default interface Wallet {
    available(): boolean;
    load(params: SaveData): void;
    toJSON(): SaveData;
    ownAddress(address: string): OwnAddressState;
    getPair(address: string): ECPair;
    addAddress(pair: ECPair): void;
    listAddresses(): string[];
    getClassId(): string;
    initDialogue(data: string[] | undefined | null): void;
}

export interface PasswordWallet {
    // save entropy to memory and encrypt when serialize
    encrypt(password: string): void;
    // decrypt private and call load() with public data
    decrypt(password: string | 1234): void;
    decryptPrompted(): void;
    setChildWallet(wallet: Wallet): void;
}