import Command from "../component/command";
import api from "../cp-client";

export default class SendTxCommand implements Command {
    async execute(args: string[]): Promise<void> {
        if (args.length == 0) {
            console.log("usage: monapa sendtx [RAWTX] [RAWTX] ...");
            return;
        }
        for (let data of args.map(rawtx => ({ rawtx }))) {
            try {
                const txid = (await api.cmdExplore("/tx/send", data)).txid;
                console.log(txid);
            } catch (e) {
                console.error(e.response.data);
            }
        }
    }
    description(): string {
        return "Sends transactions";
    }
}