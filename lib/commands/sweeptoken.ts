import Command from "../component/command";
import { ArgumentParser } from "argparse";
import api from "../cp-client";
import { TokenEntry } from "../misc/extratypes";
import { ECPair, TransactionBuilder, Transaction } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import { keyInYN } from "readline-sync";
import { toInteger, toBoolean } from "../misc/conv";
import commands from "./all";

const argParser = new ArgumentParser({
    description: "Sweep tokens from a address",
    addHelp: true,
    prog: "monapa sweeptoken"
});

argParser.addArgument("privKey", {});
argParser.addArgument("destination", {});
argParser.addArgument("--feerate", {
    required: false,
    type: toInteger,
    defaultValue: 10000, // 1000 wat/kb
    help: "Fee rate (wat/kb)"
});
argParser.addArgument("--memo", {
    required: false,
    help: "Memo to attach with"
});
argParser.addArgument("--memo-is-hex", {
    defaultValue: false,
    required: false,
    type: toBoolean,
    help: "Memo is represented in Hex"
});

export default class SweepTokenCommand implements Command {
    async execute(args: string[]): Promise<void> {
        const parsed = argParser.parseArgs(args);
        const pair = ECPair.fromWIF(parsed.privKey, monacoin);
        const sourceAddress = pair.getAddress();

        const returned = await api.cmd("get_normalized_balances", {
            addresses: [sourceAddress]
        }) as TokenEntry[];
        console.log(`Following tokens are found at address ${sourceAddress}.`);
        console.log(returned.map(a => a.asset_longname || a.asset).join(', '));
        const askCont = keyInYN("Continue?");
        if (!askCont) {
            console.log("Cancelled.");
            return;
        }
        for (let entry of returned) {
            console.log(`Sweeping ${entry.asset_longname || entry.asset}`);
            const memoAdditional = parsed.memo ? {
                memo: parsed.memo,
                memo_is_hex: parsed.memo_is_hex
            } : {};
            const params = Object.assign({
                source: sourceAddress,
                destination: parsed.destination,
                asset: entry.asset,
                quantity: entry.quantity,
                use_enhanced_send: true,
                fee_per_kb: parsed.feerate
            }, memoAdditional);
            let unsignedTx: Buffer;
            try {
                unsignedTx = Buffer.from(await api.cmdLib("create_send", params), "hex");
            } catch (error) {
                if (typeof error == "object" && error.type == "Exception") {
                    const err = JSON.parse(error.message);
                    console.log(`Error: ${err.code} ${err.message}`);
                }
                continue;
            }
            const tx = Transaction.fromBuffer(unsignedTx);
            const txb = TransactionBuilder.fromTransaction(tx, monacoin);
            for (let i = 0; i < txb.inputs.length; i++) {
                // @ts-ignore
                txb.inputs[i] = {};
                txb.sign(i, pair);
            }
            const txData = txb.build().toHex();
            await commands.sendtx.execute([txData]);
        }
    }
    description(): string {
        return "Sweep tokens from a address";
    }
}