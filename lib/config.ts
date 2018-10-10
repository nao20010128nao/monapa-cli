import path from "path";
import process from "process";
import Wallet from "./component/wallet";
import fs from "fs";
import walletHelper from "./misc/wallethelper";

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
    load(): void {
        if (!fs.existsSync(this.configPath())) {
            return;
        }
        const data = fs.readFileSync(this.configPath(), { encoding: "utf8" });
        const { wallet } = JSON.parse(data);
        this.wallet = walletHelper.deserializeWallet(wallet);
    }
    save(): void {
        if (!fs.existsSync(this.profilePath())) {
            fs.mkdirSync(this.profilePath());
        }
        const data = {
            wallet: walletHelper.serializeWallet(this.wallet)
        };
        fs.writeFileSync(this.configPath(), JSON.stringify(data));
    }
}

export default new Config();