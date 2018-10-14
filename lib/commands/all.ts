import Command from "../component/command";
import Help from "./help";
import Version from "./version";
import MakeWallet from "./makewallet";
import GetBalance from "./getbalance";
import Send from "./send";
import SendTx from "./sendtx";
import AddressInfo from "./addressinfo";
import ListMyAddress from "./listmyaddress";
import TokenInfo from "./tokeninfo";
import SweepToken from "./sweeptoken";
import SweepMona from "./sweepmona";
import SendMona from "./sendmona";

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
map.addressinfo = new AddressInfo();
map.listmyaddress = new ListMyAddress();
map.tokeninfo = new TokenInfo();
map.sweeptoken = new SweepToken();
map.sweepmona = new SweepMona();
map.sendmona = new SendMona();

export default map;