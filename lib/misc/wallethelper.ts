import Wallet, { PasswordWallet } from "../component/wallet";
import PubKeyWallet from "../wallet/pubkeywallet";
import PrivKeyWallet from "../wallet/privkeywallet";
import EncryptedWallet from "../wallet/encryptedwallet";
import Config from "../config";

export const types: any = {
    pubkey: PubKeyWallet,
    privkey: PrivKeyWallet,
    encrypted: EncryptedWallet
};

export type SaveData = { public: any, private: any };
export type ExportedWallet = {
    type: string,
    data: SaveData
};
export type OwnAddressState = "false" | "pubkey" | "privatekey";

export function deserializeWallet(data: ExportedWallet | null): Wallet | null {
    if (!data) {
        return null;
    }
    const walletType = types[data.type];
    if (walletType) {
        const wallet = new walletType() as Wallet;
        wallet.load(data.data);
        return wallet;
    } else {
        return null;
    }
}

export function serializeWallet(wallet: Wallet | null): ExportedWallet | null {
    if (!wallet) {
        return null;
    }
    return {
        type: wallet.getClassId(),
        data: wallet.toJSON()
    };
}

export function checkWalletExist(readonly: boolean = false): never | void {
    const wallet = Config.getWallet();
    if (!wallet) {
        throw new Error("Create wallet first.");
    }
    if ((wallet as any).decrypt) {
        if (readonly) {
            ((wallet as any) as PasswordWallet).decrypt(1234);
        } else {
            ((wallet as any) as PasswordWallet).decryptPrompted();
        }
    }
}
