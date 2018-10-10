import path from "path";
import process from "process";
import Wallet from "./component/wallet";

class Config {
    private wallet: Wallet;
    profilePath(): string {
        let basePath = "";
        if (process.env.APPDATA) {
            basePath = path.join(process.env.APPDATA, "Monapa-CLI");
        } else if (process.env.HOME) {
            basePath = path.join(process.env.HOME, ".monapa");
        } else if (process.platform == "darwin") {
            basePath = path.join(process.env.HOME || "/", "Library/Application Support", "Monapa-CLI");
        }
        return basePath;
    }
    configPath(): string {
        return path.join(this.profilePath(), 'config.json');
    }
    setWallet(wallet: Wallet): void {
        this.wallet = wallet;
    }
    getWallet(): Wallet {
        return this.wallet;
    }
}

export default new Config();