import Wallet from "../component/wallet";
import PubKeyWallet from "../wallet/pubkeywallet";
import PrivKeyWallet from "../wallet/privkeywallet";

const types = {
    pubkey: PubKeyWallet,
    privkey: PrivKeyWallet
};

export type SaveData = { public: any, private: any };
export type ExportedWallet = {
    type: string,
    data: SaveData
};

function deserializeWallet(data: any): Wallet {
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

function serializeWallet(wallet: Wallet): ExportedWallet {
    if (!wallet) {
        return null;
    }
    return {
        type: wallet.getClassId(),
        data: wallet.toJSON()
    };
}

export default { deserializeWallet, serializeWallet };