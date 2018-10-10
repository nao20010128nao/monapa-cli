import { argv } from "process";
import commands from "./commands/all";

const commandName = argv[2];
const realArgs = argv.slice(3);

const command = commands[commandName];
if (command) {
    command.execute(realArgs);
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
