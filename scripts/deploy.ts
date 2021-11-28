// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import BigNumber from "bignumber.js";
import { Logger } from "tslog";
import { ethers } from "hardhat";
import Web3 from "web3";
import { saveDeployedContracts } from "./helper";

const log: Logger = new Logger({ name: "solidityTask" });

async function main() {
  log.info("Starting task...");
  const signers = await ethers.getSigners();
  const web3 = new Web3();
  // contract factories for proxy, v1 and v2
  console.info("Fetching Contract Factories");
  const myErc20v1Factory = await ethers.getContractFactory("MyERC20");
  const myErc20v2Factory = await ethers.getContractFactory("MyERC20v2");
  const proxyFactory = await ethers.getContractFactory(
    "ExtendedTransparentUpgradeableProxy"
  );

  console.time("Deploying MyERC20v1 Logic...");
  const logicv1 = await myErc20v1Factory.deploy();
  await logicv1.deployed();

  log.info(`ERC20v1: ${logicv1.address}`);
  console.timeEnd("Deploying MyERC20v1 Logic...");

  console.time("Deploying Proxy Contract...");
  const proxyDeployParams = web3.eth.abi.encodeParameters(
    ["string", "string"],
    ["My Token", "MTKN"]
  );
  const proxy = await proxyFactory.deploy(
    logicv1.address,
    signers[0].address,
    proxyDeployParams
  );

  await proxy.deployed();
  log.info(`ProxyAddress: ${proxy.address}`);
  console.timeEnd("Deploying Proxy Contract...");

  console.time("Minting Token worth 0.2ETH ...");
  const mintTx = await logicv1
    .attach(proxy.address)
    .connect(signers[0])
    .mint({ value: new BigNumber(0.2).shiftedBy(18).toFixed(0) });
  const mintTxH = await mintTx.wait();
  log.info(`Minting Tx: ${mintTxH.transactionHash}`);
  console.timeEnd("Minting Token worth 0.2ETH ...");

  console.time("Deploying MyERC20v2 ...");
  const logicv2 = await myErc20v2Factory.deploy();
  await logicv2.deployed();
  log.info(`ERC20v2: ${logicv2.address}`);
  console.timeEnd("Deploying MyERC20v2 ...");
  console.time("Upgrading Proxy to MyERC20v2 ...");
  const upgradeTx = await proxy.upgradeTo(logicv2.address);
  const upgradeTxH = await upgradeTx.wait();
  log.info(`Upgrade Tx: ${upgradeTxH.transactionHash}`);
  console.timeEnd("Upgrading Proxy to MyERC20v2 ...");

  console.time("Performing Kill Switch on Proxy ...");
  const killTx = await proxy.killMe();
  const killTxH = await killTx.wait();
  log.info(`KillSwitch Tx: ${killTxH.transactionHash}`);
  console.timeEnd("Performing Kill Switch on Proxy ...");

  console.time("Burning Token worth 0.1 to get 90% ETH Back ...");
  const burnTx = await logicv2
    .attach(proxy.address)
    .connect(signers[0])
    .burn(new BigNumber(0.1).shiftedBy(18).toFixed(0));
  const burnTxH = await burnTx.wait();
  log.info(`Burning Tx: ${burnTxH.transactionHash}`);
  console.timeEnd("Burning Token worth 0.1 to get 90% ETH Back ...");
  log.info("Task Ended");

  saveDeployedContracts([
    {
      contractName: "MyERC20v1",
      contractAddress: logicv1.address,
      deploymentParams: [],
    },
    {
      contractName: "MyERC20v2",
      contractAddress: logicv2.address,
      deploymentParams: [],
    },
    {
      contractName: "ExtendedTransparentUpgradeableProxy",
      contractAddress: proxy.address,
      deploymentParams: [
        logicv1.address,
        signers[0].address,
        proxyDeployParams,
      ],
    },
  ]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
