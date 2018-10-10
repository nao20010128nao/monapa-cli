import Wallet from "../component/wallet";
import { ECPair } from "bitcoinjs-lib";
import monacoin from "../misc/network";

export default class PrivKeyWallet implements Wallet {
    private keys: object;

    available(): boolean {
        return true;
    }
    toJSON(): { public: any, private: any } {
        const publicData: object = {};
        const privateData: object = {};
        for (let key in this.keys) {
            const pair = this.getPair(key);
            publicData[pair.getAddress()] = pair.getPublicKeyBuffer().toString("base64");
            if (pair.d) {
                privateData[pair.getAddress()] = pair.toWIF();
            }
        }
        return { public: publicData, private: privateData };
    }
    ownAddress(address: string): "false" | "pubkey" | "privatekey" {
        const data = this.getPair(address);
        if (!data) {
            return "false";
        }
        if (data.d) {
            return "privatekey";
        } else {
            return "pubkey";
        }
    }
    getPair(address: string): ECPair {
        return this.keys[address];
    }
    addAddress(pair: ECPair): void {
        this.keys[pair.getAddress()] = pair;
    }
    listAddresses(): string[] {
        return Object.keys(this.keys);
    }
    load(params: { public: any, private: any }): void {
        for (let key in params.public) {
            const value = params[key];
            let pair: ECPair = null;
            if (typeof value === "string") {
                pair = ECPair.fromPublicKeyBuffer(Buffer.from(value, "base64"), monacoin);
            }
            if (pair) {
                this.addAddress(pair);
            }
        }
    }
    getClassId(): string {
        return "privkey";
    }
}