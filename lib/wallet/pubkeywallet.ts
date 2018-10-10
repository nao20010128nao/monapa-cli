import Wallet from "../component/wallet";
import { ECPair } from "bitcoinjs-lib";
import monacoin from "../misc/network";

export default class PubKeyWallet implements Wallet {
    private pubkeys: object;

    available(): boolean {
        return true;
    }
    toJSON(): { public: any, private: any } {
        const publicData: string[] = [];
        for (let key in this.pubkeys) {
            const pair = this.pubkeys[key];
            publicData.push(pair.getPublicKeyBuffer().toString("base64"));
        }
        return { public: publicData, private: null };
    }
    ownAddress(address: string): "false" | "pubkey" | "privatekey" {
        return this.getPair(address) ? "pubkey" : "false";
    }
    getPair(address: string): ECPair {
        return this.pubkeys[address];
    }
    addAddress(pair: ECPair): void {
        this.pubkeys[pair.getAddress()] = pair;
    }
    listAddresses(): string[] {
        return Object.keys(this.pubkeys);
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
}