const { assert } = require("chai");

contract("StandardToken", (accounts) => {
  let StandardTokenMock = artifacts.require("StandardTokenMock.sol");
  let token;

  before(async function () {
    token = await StandardTokenMock.deployed();
  });

  it("should return the correct totalSupply after contract deployment", async function () {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 100);

    await token.transfer(accounts[1], 100);
  });

  it("should return the correct allowance amount after approval", async function () {
    await token.approve(accounts[1], 100);
    let allowance = await token.allowance.call(accounts[0], accounts[1]);

    assert.equal(allowance, 100);
  });

  it("should return correct balances after transfer", async function () {
    await StandardTokenMock.transfer(accounts[1], 100);
    let firstAccountBalance = await StandardTokenMock.balanceOf.call(
      accounts[0]
    );

    assert.equal(firstAccountBalance, 0);

    let secondAccountBalance = await StandardTokenMock.balanceOf.call(
      accounts[1]
    );
    assert.equal(secondAccountBalance, 100);
  });

  it("should throw when attempting to transfer more than remaning balance", async () => {
    try {
      await StandardTokenMock.transfer(accounts[2], 101, {
        from: accounts[1],
        shouldPollResponse: true,
      });
      assert(
        false,
        "didn't throw when attempting to transfer more than remaning balance"
      );
    } catch (error) {
      assert.equal(error, "REVERT opcode executed");
    }
  });

  it("should return correct balances after transfering from another account", async function () {
    await token.approve(accounts[2], 100, { from: accounts[1] });
    await token.transferFrom(accounts[1], accounts[3], 100, {
      from: accounts[2],
    });

    let balance0 = await token.balanceOf.call(accounts[1]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf.call(accounts[3]);
    assert.equal(balance1, 100);

    let balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2, 0);
  });

  it("should throw an error when trying to transfer more than allowed", async function () {
    await token.approve(accounts[1], 100, { from: accounts[3] });

    try {
      await token.transferFrom(accounts[3], accounts[0], 101, {
        from: accounts[1],
        shouldPollResponse: true,
      });
      assert(
        false,
        "didn't throw in case of trasnferring more than allowed amount"
      );
    } catch (error) {
      assert.equal(error, "REVERT opcode executed");
    }
  });

  describe("validating updates of allowance in case of increase/decrease allowance", function () {
    let preApproved;

    it("should start with 100", async function () {
      preApproved = await token.allowance.call(accounts[0], accounts[1]);
      assert.equal(preApproved, 100);
    });

    it("should increase by 50 then decrease by 10", async function () {
      await token.increaseAllowance(accounts[1], 50);
      let postIncrease = await token.allowance.call(accounts[0], accounts[1]);
      assert.equal(preApproved.add(50).toString(), postIncrease.toString());
      await token.decreaseAllowance(accounts[1], 10);
      let postDecrease = await token.allowance(accounts[0], accounts[1]);
      assert.equal(postIncrease.sub(10).toString(), postDecrease.toString());
    });
  });
});
