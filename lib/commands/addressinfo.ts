import Command from "../component/command";
import { checkWalletExist } from "../misc/wallethelper";
import Config from "../config";
import { address as baddr } from "bitcoinjs-lib";

export default class AddressInfoCommand implements Command {
    execute(args: string[]): void {
        checkWalletExist(false);
        const wallet = Config.getWallet();
        for (const address of args) {
            let wasAddress = false;
            console.log(`${address}:`)
            try {
                const b58c = baddr.fromBase58Check(address);
                wasAddress = true;
                console.log(`  Version : ${b58c.version}`);
                console.log(`  Hash    : ${b58c.hash.toString('hex')}`);
                if (b58c.version == 50) {
                    const state = wallet.ownAddress(address);
                    console.log(`  Address known: ${state}`);
                    if (state !== "false") {
                        const kp = wallet.getPair(address);
                        console.log(`  Pubkey (hex): ${kp.getPublicKeyBuffer().toString('hex')}`);
                        console.log(`      (base64): ${kp.getPublicKeyBuffer().toString('base64')}`);
                    }
                } else {
                    console.log("  This address is not P2PKH address of Monacoin.");
                }
            } catch (e) { }
            try {
                const bech32 = baddr.fromBech32(address);
                wasAddress = true;
                console.log(`  Prefix  : ${bech32.prefix}`);
                console.log(`  Version : ${bech32.version}`);
                console.log(`  Data    : ${bech32.data.toString('hex')}`);
                console.log("  This address is not P2PKH address of Monacoin.");
            } catch (e) { }
            if(!wasAddress){
                console.log("  Unrecognized format");
            }
        }
    }
    description(): string {
        return "Displays address info";
    }
}