import axios from "axios";

let endpointPos = 0;
const endpoints = [
    "https://monaparty.tk/_api",
    "https://wallet.monaparty.me/_api"
];
let insightPos = 0;
const insights = [
    "https://mona.monacoin.ml/insight-api-monacoin",
    "https://mona.insight.monaco-ex.org/insight-api-monacoin",
    "https://insight.electrum-mona.org/insight-api-monacoin"
];

export default {
    cmd: async (method: string, params: any) => {
        const r = await axios.post(endpoints[endpointPos = (endpointPos++ % endpoints.length)], {
            params,
            id: 0,
            jsonrpc: "2.0",
            method
        });
        if (r.data.error && r.data.error.code) {
            throw r.data.error.data;
        }
        return r.data.result;
    },
    cmdLib: async (method: string, params: any) => {
        const r = await axios.post(endpoints[endpointPos = (endpointPos++ % endpoints.length)], {
            params: {
                method,
                params
            },
            id: 0,
            jsonrpc: "2.0",
            method: "proxy_to_counterpartyd"
        });
        if (r.data.error && r.data.error.code) {
            throw r.data.error.data;
        }
        return r.data.result;
    },
    cmdExplore: async (dir: string, params: any) => {
        const r = await axios(insights[insightPos = (insightPos++ % insights.length)], {
            params
        });
        if (r.data.error && r.data.error.code) {
            throw r.data.error.data;
        }
        return r.data;
    }
};