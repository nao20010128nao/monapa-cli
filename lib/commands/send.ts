import Command from "../component/command";
import Config from "../config";
import { checkWalletExist } from "../misc/wallethelper";
import api from "../cp-client";
import { toBigNumber, toInteger, toBoolean } from "../misc/conv";
import { ArgumentParser } from "argparse";
import { TokenEntry, TypedObject } from "../misc/extratypes";
import BigNumber from "bignumber.js";
import { keyInYN, keyInSelect } from "readline-sync";
import { TransactionBuilder, Transaction } from "bitcoinjs-lib";
import monacoin from "../misc/network";
import commands from "./all";

const argParser = new ArgumentParser({
    description: "Send",
    addHelp: false,
    prog: "monapa send"
});
// follow @monapachan's rule
argParser.addArgument("dest", {
    help: "Destination address"
});
argParser.addArgument("amount", {
    type: toBigNumber,
    help: "Amount to send in floating point"
});
argParser.addArgument("tokenName", {
    help: "Token name to send"
});

argParser.addArgument("--from", {
    required: false,
    help: "Address to send from"
});
argParser.addArgument("--feerate", {
    required: false,
    type: toInteger,
    defaultValue: 10000, // 10 wat/kb
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

export default class SendCommand implements Command {
    async execute(args: string[]): Promise<any> {
        checkWalletExist(false);
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
        const internalName = tokens[0].asset;
        // it'll be 100000000 if divisible, 1 if not
        const fixFactor = new BigNumber(tokens[0].quantity).div(tokens[0].normalized_quantity);
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
        let signed: TypedObject<string> = {};
        let unsigned: TypedObject<Buffer> = {};
        for (let { address, amount } of planned) {
            const memoAdditional = parsed.memo ? {
                memo: parsed.memo,
                memo_is_hex: parsed.memo_is_hex
            } : {};
            const params = Object.assign({
                source: address,
                destination: parsed.dest,
                asset: internalName,
                quantity: fixFactor.times(amount).toNumber(),
                use_enhanced_send: true,
                fee_per_kb: parsed.feerate
            }, memoAdditional);
            let unsignedTx: string = "";
            try {
                unsignedTx = await api.cmdLib("create_send", params);
            } catch (error) {
                if (typeof error == "object" && error.type == "Exception") {
                    const err = JSON.parse(error.message);
                    console.log(`${address}: ${err.code} ${err.message}`);
                }
                continue;
            }
            const utb = Buffer.from(unsignedTx, "hex");
            if (wallet.ownAddress(address) != "privatekey") {
                unsigned[address] = utb;
            } else {
                const kp = wallet.getPair(address);
                const txb = TransactionBuilder.fromTransaction(Transaction.fromBuffer(utb), monacoin);
                for (let i = 0; i < txb.inputs.length; i++)
                    txb.sign(i, kp);
                const txData = txb.build().toHex();
                signed[address] = txData;
            }
        }
        let transactionsAsked: boolean = false;
        if (Object.keys(signed).length != 0) {
            transactionsAsked = true;
            switch (keyInSelect(["Broadcast now", "Display rawtx"], `There is ${Object.keys(signed).length} signed transactions.`)) {
                case 0:
                    // broadcast
                    // avoid errors for Object.values, because it doesn't exist on @types/node
                    await commands.sendtx.execute(eval('Object.values')(signed));
                    break;
                case 1:
                    // display
                    for (let address in signed) {
                        console.log(`${address}: ${signed[address]}`);
                    }
                    break;
            }
        }
        if (Object.keys(unsigned).length != 0) {
            transactionsAsked = true;
            console.log(`There is ${Object.keys(unsigned).length} unsigned transactions. Please sign them to broadcast.`);
            for (let address in unsigned) {
                console.log(`${address}: ${unsigned[address].toString('hex')}`);
            }
        }
        if (!transactionsAsked) {
            console.log("No transactions to broadcast!");
        }
    }
    description(): string {
        return "Send token(s)";
    }
}