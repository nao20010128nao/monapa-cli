import Command from "../component/command";
import Config from "../config";
import { checkWalletExist } from "../misc/wallethelper";
import api from "../cp-client";

type TokenEntry = {
    address: string,
    asset: string,
    asset_longname: string | null,
    normalized_quantity: number,
    quantity: number,
    owner: boolean
};

interface TokenAddrMap {
    [key: string]: TokenEntry[];
}

export default class GetBalanceCommand implements Command {
    async execute(args: string[]): Promise<any> {
        checkWalletExist();
        const addrs = Config.getWallet().listAddresses();
        const tokens: TokenAddrMap = {};
        for (let addr of addrs) {
            tokens[addr] = [];
        }
        const returned = await api.cmd("get_normalized_balances", {
            addresses: addrs
        }) as TokenEntry[];
        for (let entry of returned) {
            tokens[entry.address].push(entry);
        }
        for (let addr of addrs) {
            const found = tokens[addr];
            if (found.length == 0) {
                continue;
            }
            console.log(`${addr}:`);
            found.sort((a, b) => {
                const an = a.asset_longname || a.asset;
                const bn = b.asset_longname || b.asset;
                return an.localeCompare(bn);
            });
            for (let entry of found) {
                const name = entry.asset_longname || entry.asset;
                console.log(`  ${name}: ${entry.normalized_quantity} ${entry.asset_longname ? entry.asset : ""} ${entry.owner ? "Owner" : ""}`);
            }
        }
    }
    description(): string {
        return "Get balance of tokens";
    }
}