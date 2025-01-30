const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  it("Should have a name", async function () {
    // Fetch Contract Factory
    const Factory = await ethers.getContractFactory("Factory");
    // Deploy Contract
    const factory = await Factory.deploy();
    // Check name
    const name = await factory.name();
    // Check name is correct
    expect(name).to.equal("Factory");

    //console.log(name);
  });
});
