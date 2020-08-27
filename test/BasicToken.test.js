const { assert } = require("chai");

var BasicTokenMock = artifacts.require("./BasicTokenMock.sol");

contract("BasicTokenMock", (accounts) => {
  let BasictokenMock;

  before(async function () {
    BasictokenMock = await BasicTokenMock.deployed();
  });

  it("should return the correct totalSupply after contract deployment", async () => {
    let totalSupply = await BasictokenMock.totalSupply.call();
    assert.equal(totalSupply.toString(), 100);
  });

  it("should return correct balances after transfer", async function () {
    await BasictokenMock.transfer(accounts[1], 100);
    let firstAccountBalance = await BasictokenMock.balanceOf.call(accounts[0]);

    assert.equal(firstAccountBalance, 0);

    let secondAccountBalance = await BasictokenMock.balanceOf.call(accounts[1]);
    assert.equal(secondAccountBalance, 100);
  });

  it("should throw when attempting to transfer more than reamining balance", async () => {
    try {
      await BasictokenMock.transfer(accounts[2], 101, {
        from: accounts[1],
        shouldPollResponse: true,
      });
      assert(
        false,
        "didn't throw when attempting to transfer more than remaining balance"
      );
    } catch (error) {
      assert.equal(error, "REVERT opcode executed");
    }
  });
});
