import process, { argv } from "process";
import commands from "./commands/all";
import Config from "./config";

Config.load();
process.on("exit", () => {
    Config.save();
});

const commandName = argv[2];
const realArgs = argv.slice(3);

const command = commands[commandName];

(async () => {
    if (command) {
        await command.execute(realArgs);
    } else {
        if (commandName) {
            console.log(`Command "${commandName}" not found.`)
        } else {
            console.log(`Command not specified.`)
        }
        console.log("monapa [COMMAND] [ARGS]");
        console.log("Where [COMMAND] is one of:");
        commands.help.execute(["--version=false"]);
    }
})().then(a => a, console.error);
