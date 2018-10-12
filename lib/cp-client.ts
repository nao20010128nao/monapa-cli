import axios from "axios";

const endpoints = [
    'https://wallet.monaparty.me/_api'
];

export default {
    cmd: async (method: string, params: any) => {
        const r = await axios.post(endpoints[Math.floor(Math.random() * endpoints.length)], {
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
        const r = await axios.post(endpoints[Math.floor(Math.random() * endpoints.length)], {
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
    }
};