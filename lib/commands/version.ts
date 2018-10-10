declare function require(s: string): any;
import Command from "../component/command";

export default class VersionCommand implements Command {
    execute(args: string[]): void {
        const version = require("../../package.json").version;
        console.log(`Monapa v${version}`);
        console.log("Created by nao20010128nao");
    }
    description(): string {
        return "Displays version and exit";
    }
}