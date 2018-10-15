import Command from "../component/command";
import Config from "../config";
import { checkWalletExist } from "../misc/wallethelper";
import api from "../cp-client";
import { ArgumentParser } from "argparse";
import { toBoolean } from "../misc/conv";
import BigNumber from "bignumber.js";

const argParser = new ArgumentParser({
    description: "Get balance",
    addHelp: true,
    prog: "monapa balancetoken"
});
argParser.addArgument(["--watanabes", "--satoshis"], {
    required: false,
    type: toBoolean,
    defaultValue: false,
    help: "Display amounts in watanabes"
});

export default class VersionCommand implements Command {
    async execute(args: string[]): Promise<void> {
        checkWalletExist(true);
        const parsed = argParser.parseArgs(args);
        const addrs = Config.getWallet().listAddresses();
        let totalBalance: BigNumber = new BigNumber(0);
        const unit = parsed.watanabes ? "watanabes" : "MONA";
        for (let addr of addrs) {
            const info = await api.cmdExplore(`/addr/${addr}`);
            const value: BigNumber = parsed.watanabes ? new BigNumber(info.balanceSat) : new BigNumber(info.balance);
            totalBalance = totalBalance.plus(value);
            console.log(`${addr}: ${value} ${unit}`);
        }
        console.log(`Total: ${totalBalance} ${unit}`);
    }
    description(): string {
        return "Gets balance of MONA";
    }
}