import Wallet from "../component/wallet";
import { ECPair } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import { question } from "readline-sync";

export default class PrivKeyWallet implements Wallet {
    private keys: any = {};

    available(): boolean {
        return true;
    }
    toJSON(): { public: any, private: any } {
        const publicData: any = {};
        const privateData: any = {};
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
            const pub = params.public[key];
            const priv = params.private[key];
            let pair: ECPair | null = null;
            if (typeof priv === "string") {
                pair = ECPair.fromWIF(priv, monacoin);
            } else if (typeof pub === "string") {
                pair = ECPair.fromPublicKeyBuffer(Buffer.from(pub, "base64"), monacoin);
            }
            if (pair) {
                this.addAddress(pair);
            }
        }
    }
    getClassId(): string {
        return "privkey";
    }
    initDialogue(data: string[] | undefined | null): void {
        const procData = (result: string) => {
            let pair: ECPair | null = null;
            try {
                pair = ECPair.fromWIF(result, monacoin);
            } catch (e) {
                try {
                    pair = ECPair.fromPublicKeyBuffer(Buffer.from(result, "base64"), monacoin);
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