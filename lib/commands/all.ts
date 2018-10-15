import Command from "../component/command";
import Help from "./help";
import Version from "./version";
import MakeWallet from "./makewallet";
import BalanceToken from "./balancetoken";
import Send from "./send";
import SendTx from "./sendtx";
import AddressInfo from "./addressinfo";
import ListMyAddress from "./listmyaddress";
import TokenInfo from "./tokeninfo";
import SweepToken from "./sweeptoken";
import SweepMona from "./sweepmona";
import SendMona from "./sendmona";
import BalanceMona from "./balancemona";

interface CommandMap {
    [key: string]: Command;
}

const map: CommandMap = {};
map.help = new Help();
map.version = new Version();
map.makewallet = new MakeWallet();
map.balancetoken = new BalanceToken();
map.send = new Send();
map.sendtx = new SendTx();
map.addressinfo = new AddressInfo();
map.listmyaddress = new ListMyAddress();
map.tokeninfo = new TokenInfo();
map.sweeptoken = new SweepToken();
map.sweepmona = new SweepMona();
map.sendmona = new SendMona();
map.balancemona = new BalanceMona();

export default map;