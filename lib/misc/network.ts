import { Network } from "bitcoinjs-lib";

const monacoin: Network = {
    messagePrefix: '\x19Monacoin Signed Message:\n',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
    },
    pubKeyHash: 50,
    scriptHash: 55,
    wif: 176,
    bech32: "mona"
};

export default monacoin;