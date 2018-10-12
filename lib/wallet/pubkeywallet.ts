import Wallet from "../component/wallet";
import { ECPair } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import { question } from "readline-sync";

export default class PubKeyWallet implements Wallet {
    private pubkeys: any;

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
            const value = params.public[key];
            let pair: ECPair | null = null;
            if (typeof value === "string") {
                pair = ECPair.fromPublicKeyBuffer(Buffer.from(value, "base64"), monacoin);
            }
            if (pair) {
                this.addAddress(pair);
            }
        }
    }
    getClassId(): string {
        return "pubkey";
    }
    initDialogue(data: string[] | undefined | null): void {
        const procData = (result: string) => {
            let pair: ECPair | null = null;
            try {
                pair = ECPair.fromPublicKeyBuffer(Buffer.from(result, "base64"), monacoin);
            } catch (e) {
                try {
                    pair = ECPair.fromPublicKeyBuffer(Buffer.from(result, "hex"), monacoin);
                } catch (e) { }
            }
            if (pair) {
                console.log(`Added ${pair.getAddress()}`);
                this.addAddress(pair);
            } else {
                console.log("Illegal input!");
            }
        }
        if (data) {
            for (let res of data) {
                procData(res);
            }
        } else {
            while (true) {
                const result = question("Type public key (Base64 or hex, no wrap). Leave blank to finish", {});
                if (!result) {
                    break;
                }
                procData(result);
            }
        }
    }
}