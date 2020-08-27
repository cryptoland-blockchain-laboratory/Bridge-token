const { assert } = require("chai");

contract("BridgeToken", (accounts) => {
  let token, owner, recipient;

  let BridgeToken = artifacts.require("./BridgeToken.sol");
  let Token677ReceiverMock = artifacts.require("./Token677ReceiverMock.sol");
  let NotTRC677Compatible = artifacts.require("./NotTRC677Compatible.sol");
  let BrgReceiver = artifacts.require("./BrgReceiver.sol");

  const TOKEN_UNIT = 1000000;
  const TOKEN_TOTAL_SUPPLY = 10000000000;
  const emptyAddress = "410000000000000000000000000000000000000000";

  before(async () => {
    owner = accounts[0];
    recipient = accounts[1];
    token = await BridgeToken.deployed();
  });

  it("should assign all of the balance to the owner", async () => {
    let balance = await token.balanceOf.call(owner);
    assert.equal(balance.toString(), TOKEN_TOTAL_SUPPLY * TOKEN_UNIT);
  });

  describe("#transfer(address,uint256)", () => {
    let receiver, sender, transferAmount;

    beforeEach(async () => {
      receiver = await Token677ReceiverMock.deployed();
      sender = accounts[1];
      transferAmount = 100;

      await token.transfer(sender, transferAmount, {
        from: owner,
        shouldPollResponse: true,
      });
      assert.equal(await receiver.sentValue(), 0);
    });

    it("should throw when attempting to transfer to a empty address", async () => {
      try {
        await token.transfer(emptyAddress, transferAmount, {
          from: sender,
          shouldPollResponse: true,
        });
        assert(false, "didn't throw in case of sending to a empty address");
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should not let you transfer to the token contract itself", async () => {
      try {
        await token.transfer(token.address, transferAmount, {
          from: sender,
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of sending token to the token contract"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should transfer the tokens", async () => {
      let balance = await token.balanceOf.call(receiver.address);
      assert.equal(balance, 0);

      await token.transfer(receiver.address, transferAmount, { from: sender });

      balance = await token.balanceOf.call(receiver.address);
      assert.equal(balance.toString(), transferAmount);
    });

    it("should NOT call the fallback on transfer", async () => {
      await token.transfer(receiver.address, transferAmount, { from: sender });

      let calledFallback = await receiver.calledFallback();
      assert(!calledFallback);
    });

    it("should return true when the transfer succeeds", async () => {
      let success = await token.transfer(receiver.address, transferAmount, {
        from: sender,
        shouldPollResponse: true,
      });
      assert(success);
    });

    it("should throw when the transfer fails", async () => {
      try {
        await token.transfer(receiver.address, 100000, {
          from: sender,
          shouldPollResponse: true,
        });
        assert(false, "didn't throw in case of lack of asset");
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    context("when sending to a contract that is not TRC677 compatible", () => {
      let nonTRC677;

      beforeEach(async () => {
        nonTRC677 = await NotTRC677Compatible.deployed();
      });

      it("should transfer the token", async () => {
        let balance = await token.balanceOf.call(nonTRC677.address);
        assert.equal(balance, 0);

        await token.transfer(nonTRC677.address, transferAmount, {
          from: sender,
        });

        balance = await token.balanceOf.call(nonTRC677.address);
        assert.equal(balance.toString(), transferAmount);
      });
    });
  });

  describe("#transferAndCall(address,uint256,bytes)", () => {
    let value = 1000;

    beforeEach(async () => {
      recipient = await BrgReceiver.deployed();

      assert.equal(await token.allowance.call(owner, recipient.address), 0);
      assert.equal(await token.balanceOf.call(recipient.address), 0);
    });

    it("should NOT let you transfer to an empty address", async () => {
      try {
        await token.transferAndCall(emptyAddress, value, "0x6c00", {
          from: owner,
          shouldPollResponse: true,
        });
        assert(false, "didn't throw");
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should NOT let you transfer to the token contract itself", async () => {
      try {
        await token.transferAndCall(token.address, value, "0x6c00", {
          from: owner,
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of transfering the token to the token contract"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should transfer the amount to the contract and call the contract", async () => {
      await token.transferAndCall(recipient.address, value, "0x6c00", {
        from: owner,
        shouldPollResponse: true,
      });

      let balance = await token.balanceOf.call(recipient.address);
      assert.equal(balance.toString(), value);

      assert.equal(await token.allowance.call(owner, recipient.address), 0);
      assert.equal(await recipient.fallbackCalled(), true);
    });
  });

  describe("#approve", () => {
    let amount = 1000;

    it("should allow token approval amounts to be updated without first resetting to zero", async () => {
      let originalApproval = 1000;
      await token.approve(recipient.address, originalApproval, {
        from: owner,
      });
      let approvedAmount = await token.allowance.call(owner, recipient.address);
      assert.equal(approvedAmount.toString(), originalApproval);

      let laterApproval = 2000;
      await token.approve(recipient.address, laterApproval, { from: owner });
      approvedAmount = await token.allowance.call(owner, recipient.address);
      assert.equal(approvedAmount.toString(), laterApproval);
    });

    it("should throw an error when approving to an empty address", async () => {
      try {
        await token.approve(emptyAddress, amount, {
          from: owner,
          shouldPollResponse: true,
        });
        assert.equal(false, "didn't throw");
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should throw an error when approving to the token contract itself", async () => {
      try {
        await token.approve(token.address, amount, {
          from: owner,
          shouldPollResponse: true,
        });
        assert.equal(
          false,
          "didn't throw in case of approving to the token contract"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });
  });

  describe("#transferFrom", () => {
    let amount = 1000;

    beforeEach(async () => {
      await token.transfer(recipient.address, amount, { from: owner });
      await token.approve(owner, amount, { from: recipient });
    });

    it("should throw an error when transferring to an empty address", async () => {
      try {
        await token.transferFrom(recipient.address, emptyAddress, amount, {
          from: owner,
          shouldPollResponse: true,
        });
        assert.equal(
          false,
          "didn't throw in case of trasfering to an empty address"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should throw an error when transferring to the token contract itself", async () => {
      try {
        await token.transferFrom(recipient.address, token.address, amount, {
          from: owner,
          shouldPollResponse: true,
        });
        assert.equal(
          false,
          "didn't throw in case of transfering to the token contract"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });
  });

  describe("#freeze", () => {
    let user, frozenAmount;

    beforeEach(async () => {
      user = accounts[3];
      frozenAmount = 500;

      await token.transfer(accounts[4], 50, { from: owner });
    });

    it("should check frozen mapping", async () => {
      await token.freeze(user, frozenAmount, {
        from: owner,
      });
      assert.equal(await token.frozenOf.call(user), frozenAmount);
    });

    it("should throw an error when transferring frozen balance to another", async () => {
      try {
        await token.transfer(owner, frozenAmount, {
          from: user,
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of transferring frozen balance to another address"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should prevent non-owners from freezing", async () => {
      try {
        await token.freeze(user, 100, {
          from: accounts[4],
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of freezing asset by non-owner address"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });
  });

  describe("#melt", () => {
    let user, frozenAmount;

    beforeEach(async () => {
      user = accounts[3];
      frozenAmount = 500;
    });

    it("should transfer molten amount of asset", async () => {
      await token.melt(user, frozenAmount, { from: owner });
      assert.equal(await token.frozenOf(user), 0);

      await token.transfer(owner, frozenAmount, { from: user });
      assert.equal(await token.balanceOf(user), 0);
    });
  });
});
