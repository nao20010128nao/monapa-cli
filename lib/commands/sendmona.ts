import Command from "../component/command";
import { ArgumentParser } from "argparse";
import api from "../cp-client";
import { ECPair, TransactionBuilder, Transaction, script, opcodes } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import { keyInYN, keyInSelect } from "readline-sync";
import { toInteger, toBoolean } from "../misc/conv";
// @ts-ignore
import coinSelect from "coinselect";
import commands from "./all";
import config from "../config";
import { checkWalletExist } from "../misc/wallethelper";
import BigNumber from "bignumber.js";
import { TypedObject, TypedNumberObject } from "../misc/extratypes";

const argParser = new ArgumentParser({
    description: "Sweep tokens from a address",
    addHelp: true,
    prog: "monapa sweeptoken"
});

// follow @tipmona's "tip" rule
argParser.addArgument("destination", {
    help: "Destination to send"
});
argParser.addArgument("amount", {
    type: toInteger,
    help: "Amount to send"
});
argParser.addArgument("--feerate", {
    required: false,
    type: toInteger,
    defaultValue: 10000, // 1000 wat/kb
    help: "Fee rate (wat/kb)"
});
argParser.addArgument("--watanabes", {
    type: toInteger,
    help: "Amount is specified in watanabes"
});
argParser.addArgument("--op-return", {
    required: false,
    help: "OP_RETURN data to attach with"
});
argParser.addArgument("--op-return-is-hex", {
    defaultValue: false,
    required: false,
    type: toBoolean,
    help: "OP_RETURN data is represented in Hex"
});

export default class SendMonaCommand implements Command {
    async execute(args: string[]): Promise<void> {
        checkWalletExist(false);
        const parsed = argParser.parseArgs(args);
        const wallet = config.getWallet();
        const addresses = wallet.listAddresses();
        const utxo = await api.cmdExplore(`/addrs/${addresses.join(',')}/utxo`);
        // copy satoshis as value to use for coinselect
        let sum: number = 0;
        for (let txo of utxo) {
            txo.value = txo.satoshis;
            sum += txo.satoshis;
        }
        let expectedOutputs: any[] = [];
        // obtain amount in watanabes
        let amountWats: number;
        if (parsed.watanabes) {
            amountWats = parsed.amount;
        } else {
            amountWats = new BigNumber(parsed.amount).times(100000000).toNumber();
        }
        if (amountWats > sum) {
            const displayRequested = new BigNumber(amountWats).dividedBy(100000000).toNumber();
            const displaySum = new BigNumber(sum).dividedBy(100000000).toNumber();
            console.log(`Cannot send ${displayRequested} MONA (${displayRequested} MONA requested, but only ${displaySum} MONA)`);
            return;
        }
        expectedOutputs.push({ value: amountWats, address: parsed.destination });
        // obtain OP_RETURN value
        if (parsed.op_return) {
            let opRet: Buffer;
            if (parsed.op_return_is_hex) {
                opRet = Buffer.from(`${parsed.op_return}`, "hex");
            } else {
                opRet = Buffer.from(`${parsed.op_return}`, "utf8");
            }
            const realScript: Buffer = script.compile([
                opcodes.OP_RETURN,
                opRet
            ]);
            expectedOutputs.push({ value: 0, realScript, script: { length: realScript.length } });
        }
        // request for change address
        const changeAddrSel = keyInSelect(addresses, "Choose change address", {
            cancel: "Random"
        });
        let changeAddress: string;
        if (changeAddrSel == -1) {
            changeAddress = addresses[Math.floor(Math.random() * (addresses.length - 1))];
        } else {
            changeAddress = addresses[changeAddrSel];
        }
        // coinselect now
        const toUse = coinSelect(utxo, expectedOutputs, parseInt(`${parsed.feerate / 1000}`));
        if (!(toUse.inputs && toUse.outputs)) {
            console.log("Failed to make a transaction: transaction too big?");
            return;
        }
        const txb = new TransactionBuilder(monacoin);
        const addressMap: TypedObject<number[]> = {};
        const vinToAddr: TypedNumberObject<string> = {};
        for (let ins of toUse.inputs) {
            const addrVin = addressMap[ins.address] = (addressMap[ins.address] || []);
            const vin = txb.addInput(ins.txid, ins.vout);
            addrVin.push(vin);
            vinToAddr[vin] = ins.address;
        }
        for (let outs of toUse.outputs) {
            if (outs.realScript) {
                txb.addOutput(outs.realScript, 0);
            } else if (outs.address) {
                txb.addOutput(outs.address, outs.value);
            } else {
                txb.addOutput(changeAddress, outs.value);
            }
        }
        const requireConf = Object.keys(addressMap).some(a => wallet.ownAddress(a) !== "privatekey");
        const mode = requireConf ? keyInSelect(["Sign as much as possible", "Don't sign at all"], "There are some addresses that we can't find private key") : 0;
        if (mode == -1) {
            console.log("Cancelled.");
            return;
        }
        if (mode == 0) {
            // sign as much as possible
            for (let i = 0; i < txb.inputs.length; i++) {
                const addr = vinToAddr[i];
                if (wallet.ownAddress(addr) == "privatekey") {
                    txb.sign(i, wallet.getPair(addr));
                }
            }
        }
        if (requireConf) {
            // the transaction is partially-signed if the confirmation is required
            console.log();
            console.log(txb.buildIncomplete().toHex());
            console.log();
            console.log("Please sign above transaction. Corresponding vin and addresses are here:");
            let unsignedKeys: string[];
            if (mode == 1) {
                unsignedKeys = Object.keys(addressMap).filter(a => wallet.ownAddress(a) !== "privatekey");
            } else {
                unsignedKeys = Object.keys(addressMap);
            }
            for (let addr of unsignedKeys) {
                console.log(`${addr}: ${addressMap[addr].join(' ')}`);
            }
        } else {
            // the transaction is fully-signed because we don't need for confirm
            const fullHex = txb.build().toHex();
            switch (keyInSelect(["Broadcast now", "Display rawtx"], `Fully-signed transaction is ready.`)) {
                case 1:
                    // broadcast
                    await commands.sendtx.execute([txb.build().toHex()]);
                    break;
                case -1:
                case 2:
                    // display
                    console.log(`${fullHex}`);
                    break;
            }
        }
    }
    description(): string {
        return "Sends MONA";
    }
}