# monapa-cli
A CLI tool for Monaparty.

## Install

```bash
git clone https://github.com/nao20010128nao/monapa-cli.git
cd monapa-cli
npm i
```

## Try now

```bash
npm run exec -- [COMMAND] [ARGS]
```

`npm run exec --` will be shortened to `monapa` below.

## Usage

```
help	Displays help and exit
version	Displays version and exit
makewallet	Creates a wallet
balancetoken	Gets balance of tokens
send	Send token(s)
sendtx	Sends transactions
addressinfo	Displays address info
listmyaddress	Lists your addresses
tokeninfo	Displays token info
sweeptoken	Sweep tokens from a address
sweepmona	Sweep MONA from a address
sendmona	Sends MONA
balancemona	Gets balance of MONA
```

### `help`
Displays help

```
monapa help
```

### `version`
Displays the version

```
monapa version
```

### `makewallet`
Makes a wallet

```
monapa makewallet
```

### `balancetoken`
Displays balances of tokens

```
monapa balancetoken [--satoshis true|false]
```
- `--satoshis` - Set to `true` to display amount in satoshis (if divisible)

### `send`
Sends Monaparty token.    
This follows [Monapa-chan](https://twitter.com/monapachan)'s format.

```
monapa send [--from FROM] [--feerate 10000] [--memo MEMO]
            [--memo-is-hex true|false]
            dest amount tokenName
```

- `--from` - The source address 8for token to send from 
- `--feerate` - The fee rate in `wat/kb` for transactions
- `--memo` - Memo for sending token
  - `--memo-is-hex` -  Set to `true` if you set `--memo` in hex.
- `dest` - Destination address to send
- `amount` - Amount to send  (amount is in float)
- `tokenName` - Token name to send

### `sendtx`
Sends transaction over the Monacoin network (mainnet)

```
monapa sendtx [RAWTX]...
```
- `RAWTX` - Raw transaction to send. Must be in hex.

### `addressinfo`
Displays address infomation

```
monapa addressinfo [ADDR]...
```
- `ADDR` - Address. Can be Base58 or Bech32.

### `listmyaddress`
Lists up your address in the wallet

```
monapa listmyaddress
```

### `tokeninfo`
Displays specified token information

```
monapa tokeninfo [TOKEN]...
```
- `TOKEN` - Token name. Can be multiple.

### `sweeptoken`
Sweeps tokens in a address

```
monapa sweeptoken [--feerate FEERATE] [--memo MEMO]
                  [--memo-is-hex MEMO_IS_HEX]
                  privKey destination
```
- `--feerate` - The fee rate in `wat/kb` for transactions
- `--memo` - Memo for sending token
  - `--memo-is-hex` -  Set to `true` if you set `--memo` in hex.
- `privKey` - Private key for token-stored address
- `destination` - Destination address to receive


### `sweepmona`
Sweeps MONA in a address

```
monapa sweepmona [--feerate FEERATE] privKey destination
```
- `--feerate` - The fee rate in `wat/kb` for transactions
- `privKey` - Private key for MONA-stored address
- `destination` - Destination address to receive

### `sendmona`
Sends MONA.

```
monapa sweeptoken [--feerate FEERATE] [--watanabes WATANABES]
                  [--op-return OP_RETURN]
                  [--op-return-is-hex OP_RETURN_IS_HEX]
                  destination amount
```

- `--feerate` - The fee rate in `wat/kb` for transactions
- `--watanabes` - Amount is specified in watanabes
- `destination` - Destination address to send
- `amount` - Amount to send

### `balancetoken`
Displays balances of tokens

```
monapa balancetoken [--watanabes true|false]
```
- `--watanabes` - Set to `true` to display amount in watanabes
  - `--satoshis` is alias for this argument
