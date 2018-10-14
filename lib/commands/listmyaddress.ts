import Command from "../component/command";
import { checkWalletExist } from "../misc/wallethelper";
import Config from "../config";

export default class ListMyAddressCommand implements Command {
    execute(args: string[]): void {
        checkWalletExist(true);
        const wallet = Config.getWallet();
        for (const address of wallet.listAddresses()) {
            console.log(address);
        }
    }
    description(): string {
        return "Lists your addresses";
    }
}