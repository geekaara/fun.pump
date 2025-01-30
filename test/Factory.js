const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  const FEE = ethers.parseUnits("0.01", 18);
  async function deployFactoryFixture() {
    //Fectch accounts
    const [deployer, creator] = await ethers.getSigners();
    //Fetch and deploy contract
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(FEE);
    // Create Token
    const transaction = await factory.connect(creator).create("Naruto", "NTO", {
      value: FEE,
    });
    await transaction.wait();
    const tokenAddress = await factory.tokens(0);
    const token = await ethers.getContractAt("Token", tokenAddress);

    return { factory, token, deployer, creator };
  }
  describe("Deployment", function () {
    it("Should have a fee", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(await factory.fee()).to.equal(FEE);
    });
    it("Should set the owner", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);
      expect(await factory.owner()).to.equal(deployer.address);
    });
  });
  describe("Create", function () {
    it("Should set the owner", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      expect(await token.owner()).to.equal(await factory.getAddress());
    });
    it("Should set the fee", async function () {
      const { creator, token } = await loadFixture(deployFactoryFixture);
      expect(await token.creator()).to.equal(creator.address);
    });
    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );
      expect(balance).to.equal(FEE);
    });
    it("Should create sales", async function () {
      const { factory, token, creator } = await loadFixture(
        deployFactoryFixture
      );
      const count = await factory.totalSupply();
      expect(count).to.equal(1);
      const sale = await factory.getTokenSale(0);
      expect(sale.token).to.equal(await token.getAddress());
      expect(sale.token).to.equal(await token.getAddress());
      expect(sale.creator).to.equal(creator.address);
      expect(sale.sold).to.equal(0);
      expect(sale.raised).to.equal(0);
      expect(sale.isOpen).to.equal(true);
    });
  });
});
