import Command from "../component/command";
import Config from "../config";
import { checkWalletExist } from "../misc/wallethelper";
import api from "../cp-client";
import { toBigNumber, toInteger } from "../misc/conv";
import { ArgumentParser } from "argparse";
import { TokenEntry } from "../misc/extratypes";
import BigNumber from "bignumber.js";
import { keyInYN } from "readline-sync";

const argParser = new ArgumentParser({
    description: "Send",
    addHelp: false
});
// follow @monapachan's rule
argParser.addArgument("dest", {
});
argParser.addArgument("amount", {
    type: toBigNumber
});
argParser.addArgument("tokenName", {
});

argParser.addArgument("--from", {
    required: false
});
argParser.addArgument("--feerate", {
    required: false,
    type: toInteger,
    defaultValue: 10 // 10 wat/bytes
});
argParser.addArgument("--memo", {
    required: false
});

export default class SendCommand implements Command {
    async execute(args: string[]): Promise<any> {
        checkWalletExist();
        const wallet = Config.getWallet();
        const parsed = argParser.parseArgs(args);
        const addrs = wallet.listAddresses();
        const returned = await api.cmd("get_normalized_balances", {
            addresses: addrs
        }) as TokenEntry[];
        let tokens: TokenEntry[] = returned.filter(a => parsed.tokenName == a.asset || parsed.tokenName == a.asset_longname);
        if (parsed.from) {
            tokens = tokens.filter(a => a.address == parsed.from);
        }
        if (tokens.length == 0) {
            if (parsed.from) {
                console.log(`You don't have a token named ${parsed.tokenName} at address ${parsed.from}`);
            } else {
                console.log(`You don't have a token named ${parsed.tokenName}!`);
            }
            return 1;
        }
        const total = tokens.map(a => new BigNumber(a.normalized_quantity)).reduce((a, b) => a.plus(b));
        if (total.lt(parsed.amount)) {
            console.log(`You don't have enough token to send! (Sending ${parsed.amount} but only ${total})`);
            return 1;
        }
        // we plan how to send:
        //   1. Sort all hold entries by amount
        //   2. Use as much as possible from the top
        // transactions may be multiple
        tokens.sort((a, b) => a.quantity - b.quantity);
        let remaining = new BigNumber(parsed.amount);
        let planned: { address: string, amount: BigNumber }[] = [];
        for (let hold of tokens) {
            if (remaining.eq(0)) {
                break;
            }
            const sendingFromAddress = BigNumber.min(hold.normalized_quantity, remaining);
            planned.push({
                address: hold.address,
                amount: sendingFromAddress
            });
            remaining = remaining.minus(sendingFromAddress);
        }
        if (!remaining.eq(0)) {
            // should be unreachable
            console.log(`Planning failure?`);
            return 1;
        }
        console.log(`About to send from ${planned.length} address(es)...`);
        for (let { address, amount } of planned) {
            console.log(`${address}: ${amount}`);
        }
        if (!keyInYN("OK?")) {
            console.log("Cancelled");
            return 0;
        }
    }
    description(): string {
        return "Send token(s)";
    }
}