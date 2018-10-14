import Command from "../component/command";
import api from "../cp-client";
import { TokenInfoEntry } from "../misc/extratypes";

export default class TokenInfoCommand implements Command {
    async execute(args: string[]): Promise<void> {
        for (const token of args) {
            console.log(`${token}: `);
            try {
                const tokenInfo = await this.realTokenInfo(token);
                console.log(`  Asset name    : ${tokenInfo.asset}`);
                if (tokenInfo.asset_longname) {
                    console.log(`  Asset longname: ${tokenInfo.asset_longname}`);
                }
                console.log(`  Owner         : ${tokenInfo.owner}`);
                console.log(`  Issuer        : ${tokenInfo.issuer}`);
                console.log(`  Divisible     : ${this.toYN(tokenInfo.divisible)}`);
                console.log(`  Locked        : ${this.toYN(tokenInfo.locked)}`);
                console.log(`  Listed        : ${this.toYN(tokenInfo.listed)}`);
                console.log(`  Total supply  : ${tokenInfo.supply}`);
                console.log(`  Description   : ${tokenInfo.description}`);
            } catch (e) {
                console.log(`  Error: ${e}`);
            }
        }
    }
    description(): string {
        return "Displays token info";
    }

    private toYN(value: boolean) {
        return value ? "Yes" : "No";
    }

    private async realTokenInfo(name: string): Promise<TokenInfoEntry> {
        let promise: Promise<TokenInfoEntry>;
        if (name == "XMP") {
            promise = Promise.resolve({
                asset: "XMP",
                owner: "",
                divisible: true,
                locked: true,
                supply: 0,
                description: "",
                issuer: "",
                listed: true
            });
        } else {
            promise = api.cmd("get_assets_info", { assetsList: [name] }).then(a => a[0]);
        }
        return await promise;
    }
}