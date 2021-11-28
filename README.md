# Simple Upgradable ERC20 Token With Kill Switch
[![Coverage Status](https://coveralls.io/repos/github/mehdi-ag/mehdi-aca/badge.svg?branch=main)](https://coveralls.io/github/mehdi-ag/mehdi-aca?branch=main)
#### Addresses and TX
```
ERC20v1: 0xfE658F8f61cA6a9D7DCf504bE4CF32ab537b2545
ProxyAddress: 0x4FFd46f95D4A8e3B03224a205DCEd6B90d5e2B3e
Minting Tx: 0x02448632b2486515d9114084daf8adaf4f322935212ff75554f14f6304cdc1d7
ERC20v2: 0x94Eb24d254524BeFD39a6755e20939F3EE20D8EC
Upgrade Tx: 0xac7a4b28c729828aaf9183d519f3a131f12a3f31d74bde1f92b2322419c018b6
KillSwitch Tx: 0xeee593f17758c4155edd08269e53efaa56175ae6a25ecd79cfc5510d6766910c
Burning Tx: 0xf9928ad115a026cb51ff6b3c3dd4425ffe3dafcf13e7a8da9eb6154840afe937
```
</br>


## Features

> - Have an owner account that can upgrade the smart contract
> - Implements ERC20
> - Anyone can send ETH to this smart contract to mint same amount of ERC20 tokens
> - Have a kill switch that permanently kills upgrade functionality. Only owner can perform this action.
> - Deploy this smart contract to Kovan testnet
> - Make a transaction to send ETH to mint ERC20 token
> - Upgrade the smart contract to add a feature that allow user to burn ERC20 token and get 90% of the ETH back
> - Perform kill switch to kill upgrade functionality
> - Make another transaction to burn ERC20 to receive ETH
> - Submit all the relevant code, including pre-upgraded contract and all the executed transactions' hash, preferably etherscan links to the transactions
>   - Transaction deploys smart contract
>   - Transaction sends ETH to mint ERC20 token
>   - Transaction performs upgrade
>   - Transaction performs kill switch
>   - Transaction that burn ERC20 token and receive ETH

</br>


## Getting Started

```
0. create .env by copying .env.example and modifying environment variables
```

```
1. yarn
2. yarn deployTask
3. yarn verifyContracts
```
</br>

## Results
```
mehdi@mehdi-VirtualBox:~/sandbox/mehdi-aca$ yarn deployTask
yarn run v1.22.10
$ hardhat run scripts/deploy.ts --network kovan
No need to generate any newer typings.
2021-11-28 20:03:19.102 INFO [solidityTask scripts/deploy.ts:15 main] Starting task...
Fetching Contract Factories
2021-11-28 20:03:44.308 INFO [solidityTask scripts/deploy.ts:30 main] ERC20v1: 0xfE658F8f61cA6a9D7DCf504bE4CF32ab537b2545
Deploying MyERC20v1 Logic...: 23.418s
2021-11-28 20:03:59.514 INFO [solidityTask scripts/deploy.ts:45 main] ProxyAddress: 0x4FFd46f95D4A8e3B03224a205DCEd6B90d5e2B3e
Deploying Proxy Contract...: 15.206s
2021-11-28 20:04:19.179 INFO [solidityTask scripts/deploy.ts:54 main] Minting Tx: 0x02448632b2486515d9114084daf8adaf4f322935212ff75554f14f6304cdc1d7
Minting Token worth 0.2ETH ...: 19.665s
2021-11-28 20:04:45.800 INFO [solidityTask scripts/deploy.ts:60 main] ERC20v2: 0x94Eb24d254524BeFD39a6755e20939F3EE20D8EC
Deploying MyERC20v2 ...: 26.621s
2021-11-28 20:05:18.854 INFO [solidityTask scripts/deploy.ts:65 main] Upgrade Tx: 0xac7a4b28c729828aaf9183d519f3a131f12a3f31d74bde1f92b2322419c018b6
Upgrading Proxy to MyERC20v2 ...: 33.054s
2021-11-28 20:05:32.625 INFO [solidityTask scripts/deploy.ts:71 main] KillSwitch Tx: 0xeee593f17758c4155edd08269e53efaa56175ae6a25ecd79cfc5510d6766910c
Performing Kill Switch on Proxy ...: 13.772s
2021-11-28 20:05:46.627 INFO [solidityTask scripts/deploy.ts:80 main] Burning Tx: 0xf9928ad115a026cb51ff6b3c3dd4425ffe3dafcf13e7a8da9eb6154840afe937
Burning Token worth 0.1 to get 90% ETH Back ...: 14.002s
2021-11-28 20:05:46.627 INFO [solidityTask scripts/deploy.ts:82 main] Task Ended
Done in 153.88s.
```

## Tests
```
yarn tests
```
```
  All Tests
    ✓ perform all task operations (992ms)
    ✓ Should not upgrade after kill Switch (304ms)
    ✓ Should not mint 0 tokens (236ms)
    ✓ Should not burn more than available tokens (266ms)
```