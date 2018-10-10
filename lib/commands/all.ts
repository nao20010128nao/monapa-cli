import Help from "./help";
import Version from "./version";
import Command from "../component/command";

interface CommandMap {
    [key: string]: Command;
}

const map: CommandMap = {};
map.help = new Help();
map.version = new Version();

export default map;