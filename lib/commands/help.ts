import Command from "../component/command";
import commands from "../commands/all";
import { toBoolean } from "../misc/conv";
import { ArgumentParser } from "argparse";

const argParser = new ArgumentParser({
    description: "Help",
    addHelp: false,
    prog: "monapa help"
});
argParser.addArgument("--version", {
    defaultValue: true,
    required: false,
    type: toBoolean
});

export default class HelpCommand implements Command {
    execute(args: string[]): void {
        const argsParsed = argParser.parseArgs(args);
        if (argsParsed.version) {
            commands.version.execute([]);
        }
        for (let cmd in commands) {
            console.log(`${cmd}\t${commands[cmd].description()}`);
        }
    }
    description(): string {
        return "Displays help and exit";
    }
}