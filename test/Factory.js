const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  const FEE = ethers.parseUnits("0.01", 18);
  async function deployFactoryFixture() {
    //Fectch accounts
    const [deployer, creator, buyer] = await ethers.getSigners();
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

    return { factory, token, deployer, creator, buyer };
  }
  async function buyTokenFixture() {
    const { factory, token, creator, buyer } = await deployFactoryFixture();
    const AMOUNT = ethers.parseUnits("10000", 18);
    const COST = ethers.parseUnits("1", 18);
    const transaction = await factory
      .connect(buyer)
      .buy(await token.getAddress(), AMOUNT, { value: COST });
    await transaction.wait();
    return { factory, token, creator, buyer };
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
  describe("Buy", function () {
    const AMOUNT = ethers.parseUnits("10000", 18);
    const COST = ethers.parseUnits("1", 18);
    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(buyTokenFixture);
      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );
      expect(balance).to.equal(FEE + COST);
    });
    it("Should update token balance", async function () {
      const { token, buyer } = await loadFixture(buyTokenFixture);
      const balance = await token.balanceOf(buyer.address);
      expect(balance).to.equal(AMOUNT);
    });
    it("Should update sales", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      expect(sale.sold).to.equal(AMOUNT);
      expect(sale.raised).to.equal(COST);
      expect(sale.isOpen).to.equal(true);
    });
    it("Should increase base cost", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture);
      const sale = await factory.tokenToSale(await token.getAddress());
      const cost = await factory.getCost(sale.sold);
      expect(cost).to.be.equal(ethers.parseUnits("0.0002"));
    });
  });
});
