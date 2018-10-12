import { Client } from "counterparty-promise";

const client = new Client({
    host: 'https://counterparty.api.monaparty.me/',
    port: 443,
    user: 'rpc',
    pass: 'rpc',
    timeout: 30000,
    ssl: true,
    sslStrict: true,
});

type PromisedFunction<P, T> = (prop: P) => Promise<T>
type AnyAnyFunction = PromisedFunction<any, any>

type ClientType = {
    cmd: (call: string, prop: any) => Promise<any>

    getAssets: AnyAnyFunction,
    getBalances: AnyAnyFunction,
    getBets: AnyAnyFunction,
    getBetExpirations: AnyAnyFunction,
    getBetMatches: AnyAnyFunction,
    getBetMatchExpirations: AnyAnyFunction,
    getBetMatchResolutions: AnyAnyFunction,
    getBroadcasts: AnyAnyFunction,
    getBtcpays: AnyAnyFunction,
    getBurns: AnyAnyFunction,
    getCancels: AnyAnyFunction,
    getCredits: AnyAnyFunction,
    getDebits: AnyAnyFunction,
    getDividends: AnyAnyFunction,
    getIssuances: AnyAnyFunction,
    getMempool: AnyAnyFunction,
    getOrders: AnyAnyFunction,
    getOrderExpirations: AnyAnyFunction,
    getOrderMatches: AnyAnyFunction,
    getOrderMatchExpirations: AnyAnyFunction,
    getSends: AnyAnyFunction,

    getAssetInfo: AnyAnyFunction,
    getSupply: AnyAnyFunction,
    getAssetNames: AnyAnyFunction,
    getHolderCount: AnyAnyFunction,
    getHolders: AnyAnyFunction,
    getMessages: AnyAnyFunction,
    getMessagesByIndex: AnyAnyFunction,
    getBlockInfo: AnyAnyFunction,
    getBlocks: AnyAnyFunction,
    getRunningInfo: AnyAnyFunction,
    getElementCounts: AnyAnyFunction,
    getUnspentTxouts: AnyAnyFunction,
    getRawtransaction: AnyAnyFunction,
    getRawtransactionBatch: AnyAnyFunction,
    searchRawTransactions: AnyAnyFunction,
    getTxInfo: AnyAnyFunction,
    searchPubkey: AnyAnyFunction,
    unpack: AnyAnyFunction,

    createBet: AnyAnyFunction,
    createBroadcast: AnyAnyFunction,
    createBtcpay: AnyAnyFunction,
    createBurn: AnyAnyFunction,
    createCancel: AnyAnyFunction,
    createDividend: AnyAnyFunction,
    createIssuance: AnyAnyFunction,
    createOrder: AnyAnyFunction,
    createSend: AnyAnyFunction,
};

export default client as ClientType;