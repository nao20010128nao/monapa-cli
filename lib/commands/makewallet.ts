import Command from "../component/command";
import { ArgumentParser } from "argparse";
import { types as WalletTypes } from "../misc/wallethelper";
import { keyInYN, keyInSelect } from "readline-sync";
import Wallet from "../component/wallet";
import Config from "../config";
import EncryptedWallet from "../wallet/encryptedwallet";

const walletIds = Object.keys(WalletTypes).filter(x => x !== "encrypted");
const argParser = new ArgumentParser({
    description: "Makes a wallet",
    addHelp: false,
    prog: "monapa makewallet"
});
argParser.addArgument("--overwrite", {
    defaultValue: "neutral",
    required: false,
    choices: ["true", "neutral", "false"]
});
argParser.addArgument("--type", {
    defaultValue: null,
    required: false,
    choices: walletIds
});
argParser.addArgument("--args", {
    defaultValue: null,
    required: false,
    nargs: "*"
});
argParser.addArgument("--password", {
    defaultValue: null,
    required: false
});

export default class MakeWalletCommand implements Command {
    execute(args: string[]): void {
        const parsed = argParser.parseArgs(args);
        if (Config.getWallet()) {
            switch (parsed.overwrite) {
                case "false":
                    return;
                case "neutral":
                    const owSel = keyInYN("You already made a wallet. Would you like to overwrite it?");
                    if (!owSel)
                        return;
                // fallthrough
                case "true":
                // pass
            }
        }
        console.log("Creating wallet...");
        let type = WalletTypes[parsed.type];
        if (!type) {
            const typeNum = keyInSelect(walletIds, `Select wallet type`);
            type = WalletTypes[walletIds[typeNum]];
        }
        if (!type) {
            console.log("Cancelled.");
            return;
        }
        const walletObj = new type() as Wallet;
        const toPass = parsed.args && parsed.args.length != 0 ? args.map(a => a.replace(/^--args=/, "")).filter(a => !!a) : null;
        console.log(toPass);
        walletObj.initDialogue(toPass);
        const encSel = parsed.password || keyInYN("You should encrypt the wallet. Encrypt now?");
        if (encSel) {
            const encryptedWallet = new EncryptedWallet();
            encryptedWallet.setChildWallet(walletObj);
            encryptedWallet.initDialogue([parsed.password]);
            Config.setWallet(encryptedWallet);
        } else {
            Config.setWallet(walletObj);
        }
    }
    description(): string {
        return "Creates a wallet";
    }
}