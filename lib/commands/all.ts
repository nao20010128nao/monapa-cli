import Command from "../component/command";
import Help from "./help";
import Version from "./version";
import MakeWallet from "./makewallet";
import GetBalance from "./getbalance";
import Send from "./send";
import SendTx from "./sendtx";

interface CommandMap {
    [key: string]: Command;
}

const map: CommandMap = {};
map.help = new Help();
map.version = new Version();
map.makewallet = new MakeWallet();
map.getbalance = new GetBalance();
map.send = new Send();
map.sendtx = new SendTx();

export default map;