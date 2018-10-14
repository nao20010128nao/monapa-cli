import Command from "../component/command";
import { ArgumentParser } from "argparse";
import api from "../cp-client";
import { TokenEntry } from "../misc/extratypes";
import { ECPair, TransactionBuilder, Transaction } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import { keyInYN } from "readline-sync";
import { toInteger, toBoolean } from "../misc/conv";
// @ts-ignore
import coinSelect from "coinselect/split";
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

export default class SweepMonaCommand implements Command {
    async execute(args: string[]): Promise<void> {
        const parsed = argParser.parseArgs(args);
        const pair = ECPair.fromWIF(parsed.privKey, monacoin);
        const sourceAddress = pair.getAddress();

        const { balance, balanceSat } = await api.cmdExplore(`/addr/${sourceAddress}`);
        if (balanceSat == 0) {
            console.log(`No MONA at address ${sourceAddress}.`);
            return;
        } else if (balanceSat < 1000) {
            console.log(`Dusty (${balanceSat} wats) MONA found at address ${sourceAddress}.`);
            return;
        }
        console.log(`${balance} MONA found at address ${sourceAddress}.`);
        const askCont = keyInYN("Continue?");
        if (!askCont) {
            console.log("Cancelled.");
            return;
        }
        console.log("Sweeping...");
        let txs: string[] = [];
        let utxos: any[] = await api.cmdExplore(`/addr/${sourceAddress}/utxo`);
        while (utxos.length != 0) {
            const toUse = utxos.slice(0, 100);
            const onlySats = toUse.map(a => a.satoshis);
            const sum = onlySats.reduce((a, b) => a + b);
            const { fee } = coinSelect(onlySats, [{}], parseInt(`${parsed.feerate / 1000}`));
            const txb = new TransactionBuilder(monacoin);
            for (let input of toUse)
                txb.addInput(input.txid, input.vout, 0);
            txb.addOutput(parsed.destination, sum - fee);
            for (let i = 0; i < txb.inputs.length; i++)
                txb.sign(i, pair);
            const txData = txb.build().toHex();
            txs.push(txData);
            utxos = utxos.slice(100);
        }
        await commands.sendtx.execute(txs);
    }
    description(): string {
        return "Sweep MONA from a address";
    }
}