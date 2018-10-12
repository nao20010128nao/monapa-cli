import Wallet from "../component/wallet";
import PubKeyWallet from "../wallet/pubkeywallet";
import PrivKeyWallet from "../wallet/privkeywallet";

export const types: any = {
    pubkey: PubKeyWallet,
    privkey: PrivKeyWallet
};

export type SaveData = { public: any, private: any };
export type ExportedWallet = {
    type: string,
    data: SaveData
};
export type OwnAddressState = "false" | "pubkey" | "privatekey";

function deserializeWallet(data: ExportedWallet | null): Wallet | null {
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

function serializeWallet(wallet: Wallet | null): ExportedWallet | null {
    if (!wallet) {
        return null;
    }
    return {
        type: wallet.getClassId(),
        data: wallet.toJSON()
    };
}

export default { deserializeWallet, serializeWallet };