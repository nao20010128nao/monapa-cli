import Wallet, { PasswordWallet } from "../component/wallet";
import { SaveData, OwnAddressState, types as walletTypes } from "../misc/wallethelper";
import { sha256Concat, sha256, aesDecrypt, aesEncrypt } from "../misc/easycrypto";
import { ECPair } from "bitcoinjs-lib";
import { questionNewPassword, question } from "readline-sync";

export default class EncryptedWallet implements Wallet, PasswordWallet {
    private myWalletData: SaveData | null = null;
    private childWallet: Wallet | null = null;
    private key: Buffer | null = null;
    private iv: Buffer | null = null;

    available(): boolean {
        return this.childWallet != null;
    }
    load(params: SaveData): void {
        this.myWalletData = params;
    }
    toJSON(): SaveData {
        if (this.key == this.iv || this.iv!.length == 33) {
            // read-only mode
            return this.myWalletData!;
        }
        const { public: publicData, private: privateData } = this.childWallet!.toJSON();
        const privJson = JSON.stringify(privateData);
        const encryptedPriv = aesEncrypt(this.key!, this.iv!, Buffer.from(privJson, "utf8"));
        const newPublicData = { type: this.childWallet!.getClassId(), public: publicData };
        return { private: encryptedPriv.toString('base64'), public: newPublicData };
    }
    ownAddress(address: string): OwnAddressState {
        return this.childWallet!.ownAddress(address);
    }
    getPair(address: string): ECPair {
        return this.childWallet!.getPair(address);
    }
    addAddress(pair: ECPair): void {
        return this.childWallet!.addAddress(pair);
    }
    listAddresses(): string[] {
        return this.childWallet!.listAddresses();
    }
    getClassId(): string {
        return "encrypted";
    }
    initDialogue(data: string[]): void {
        if (data.length >= 1 && data[0]) {
            this.encrypt(data[0]);
            return;
        }
        while (true) {
            const pass = questionNewPassword("Type new password (Cannot be empty): ");
            if (!pass) {
                console.log("Illegal input!");
                continue;
            }
            this.encrypt(pass);
            break;
        }
    }

    private makeKey(password: string): Buffer {
        let tmp = Buffer.from(password, "utf8");
        for (let i = 0; i < 10; i++)
            tmp = sha256Concat([password, tmp, "\0\0"]);
        return sha256(tmp);
    }

    private makeIv(password: string): Buffer {
        let tmp = Buffer.from(password, "utf8");
        for (let i = 0; i < 10; i++)
            tmp = sha256Concat(["\0\0", password, tmp]);
        return sha256(tmp).slice(0, 16);
    }

    encrypt(password: string): void {
        this.key = this.makeKey(password);
        this.iv = this.makeIv(password);
    }
    decrypt(password: string | 1234): void {
        if (typeof password == 'string') {
            // decrypt mode
            const { public: publicData, type } = this.myWalletData!.public;
            const encryptedPrivate = Buffer.from(this.myWalletData!.private, "base64");
            const key = this.key = this.makeKey(password);
            const iv = this.iv = this.makeIv(password);
            const decryptedPrivate = JSON.parse(aesDecrypt(key, iv, encryptedPrivate).toString('utf8'));
            this.childWallet = new (walletTypes[type])();
            this.childWallet!.load({ public: publicData, private: decryptedPrivate });
        } else {
            // flag with illegal data to notify that it's read-only
            this.key = this.iv = Buffer.alloc(33, 0);
            const { public: publicData, type } = this.myWalletData!.public;
            this.childWallet = new (walletTypes[type])();
            this.childWallet!.load({ public: publicData, private: null });
        }
    }
    decryptPrompted(): void {
        while (true) {
            const pw = question("Type password to decrypt (Leave blank to public-only) : ", {
                hideEchoBack: true,
                mask: "*"
            })
            try {
                if (pw)
                    this.decrypt(pw);
                else
                    this.decrypt(1234);
                break;
            } catch (error) {
                console.log("Wallet decryption failed.");
            }
        }
    }
    setChildWallet(wallet: Wallet): void {
        this.childWallet = wallet;
    }
}