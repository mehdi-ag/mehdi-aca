import BigNumber from "bignumber.js";
import { expect } from "chai";
import { ethers } from "hardhat";
import Web3 from "web3";

describe("All Tests", function () {
  it("perform all task operations", async function () {
    const signers = await ethers.getSigners();
    const w3 = new Web3();
    const myErc20 = await ethers.getContractFactory("MyERC20");
    const myErc20v2 = await ethers.getContractFactory("MyERC20v2");

    const logic = await myErc20.deploy();
    await logic.deployed();

    const Proxy = await ethers.getContractFactory(
      "ExtendedTransparentUpgradeableProxy"
    );
    const proxy = await Proxy.deploy(
      logic.address,
      signers[0].address,
      w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
    );
    await proxy.deployed();

    const balance1ETH = await ethers.provider.getBalance(signers[0].address);
    await logic
      .attach(proxy.address)
      .connect(signers[0])
      .mint({ value: "100000000000000000000" });
    const balance2ETH = await ethers.provider.getBalance(signers[0].address);

    const res = await logic
      .attach(proxy.address)
      .connect(signers[0])
      .balanceOf(signers[0].address);
    // should get 100 Token from the contract
    expect(new BigNumber(res.toHexString()).toFixed(0)).to.equal(
      "100000000000000000000"
    );

    const logicv2 = await myErc20v2.deploy();
    await logicv2.deployed();
    await proxy.upgradeTo(logicv2.address);
    await proxy.killMe();

    await logicv2
      .attach(proxy.address)
      .connect(signers[0])
      .burn("100000000000000000000");

    const balance3ETH = await ethers.provider.getBalance(signers[0].address);
    // 100 ETH should get deducted from the balance after minting
    expect(
      new BigNumber(balance1ETH.toHexString())
        .minus(new BigNumber(balance2ETH.toHexString()))
        .shiftedBy(-18)
        .toFixed(0)
    ).to.equal("100");

    // getting back 90% of the ETH after burn
    expect(
      new BigNumber(balance3ETH.toHexString())
        .minus(new BigNumber(balance2ETH.toHexString()))
        .shiftedBy(-18)
        .toFixed(0)
    ).to.equal("90");
  });

  it("Should not upgrade after kill Switch", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20");
      const myErc20v2 = await ethers.getContractFactory("MyERC20v2");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
      );
      await proxy.deployed();

      await proxy.killMe();
      const logicv2 = await myErc20v2.deploy();
      await logicv2.deployed();
      await proxy.upgradeTo(logicv2.address);
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains(
      "ExtendedTransparentUpgradeableProxy: Kill Switch Activated"
    );
  });

  it("Should not mint 0 tokens", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
      );
      await proxy.deployed();

      await logic
        .attach(proxy.address)
        .connect(signers[0])
        .mint({ value: "0" });
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains("ETH <= 0");
  });
  it("Should not mint 0 tokens v2", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20v2");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
      );
      await proxy.deployed();

      await logic
        .attach(proxy.address)
        .connect(signers[0])
        .mint({ value: "0" });
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains("ETH <= 0");
  });
  it("Should not burn 0 tokens v2", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20v2");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
      );
      await proxy.deployed();

      await logic
        .attach(proxy.address)
        .connect(signers[0])
        .mint({ value: "1000000000" });
      await logic
        .attach(proxy.address)
        .connect(signers[0])
        .burn("0");
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains("ETH <= 0");
  });
  it("Should not burn more than available tokens", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20");
      const myErc20v2 = await ethers.getContractFactory("MyERC20v2");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        w3.eth.abi.encodeParameters(["string", "string"], ["My Token", "MTKN"])
      );
      await proxy.deployed();

      const balance1ETH = await ethers.provider.getBalance(signers[0].address);

      const logicv2 = await myErc20v2.deploy();
      await logicv2.deployed();
      await proxy.upgradeTo(logicv2.address);
      await logicv2
        .attach(proxy.address)
        .connect(signers[0])
        .mint({ value: "100000000000000000000" });
      const balance2ETH = await ethers.provider.getBalance(signers[0].address);
      const res = await logicv2
        .attach(proxy.address)
        .connect(signers[0])
        .balanceOf(signers[0].address);
      // should get 100 Token from the contract
      expect(new BigNumber(res.toHexString()).toFixed(0)).to.equal(
        "100000000000000000000"
      );

      // 100 ETH should get deducted from the balance after minting
      expect(
        new BigNumber(balance1ETH.toHexString())
          .minus(new BigNumber(balance2ETH.toHexString()))
          .shiftedBy(-18)
          .toFixed(0)
      ).to.equal("100");

      await logicv2
        .attach(proxy.address)
        .connect(signers[0])
        .burn("900000000000000000000");
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains("ERC20: burn amount exceeds balance");
  });
  it("Non Owner can not upgrade", async function () {
    let err = "";
    try {
      const signers = await ethers.getSigners();
      const w3 = new Web3();
      const myErc20 = await ethers.getContractFactory("MyERC20");
      const myErc20v2 = await ethers.getContractFactory("MyERC20v2");

      const logic = await myErc20.deploy();
      await logic.deployed();

      const Proxy = await ethers.getContractFactory(
        "ExtendedTransparentUpgradeableProxy"
      );
      const upgradeParams = w3.eth.abi.encodeParameters(
        ["string", "string"],
        ["My Token", "MTKN"]
      );
      const proxy = await Proxy.deploy(
        logic.address,
        signers[0].address,
        upgradeParams
      );
      await proxy.deployed();

      const logicv2 = await myErc20v2.deploy();
      await logicv2.deployed();
      await proxy.admin()
      await proxy.implementation()
      await proxy.changeAdmin(signers[1].address);
      
      await proxy
        .connect(signers[1])
        .upgradeToAndCall(logicv2.address, upgradeParams);
      
      await proxy
      .connect(signers[2])
      .upgradeToAndCall(logicv2.address, upgradeParams);
    } catch (e) {
      err = (e as any).toString();
    }
    expect(err).to.be.contains("Error: Transaction reverted");
  });
});
