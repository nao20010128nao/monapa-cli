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
monapa balancetoken [--satoshis=true|false]
```
