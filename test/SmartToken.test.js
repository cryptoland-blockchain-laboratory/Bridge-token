const { assert } = require("chai");

contract("SmartToken", (accounts) => {
  let SmartToken = artifacts.require("./mock/SmartTokenMock.sol");
  let Token677ReceiverMock = artifacts.require("./Token677ReceiverMock.sol");
  let NotTRC677Compatible = artifacts.require("./NotTRC677Compatible.sol");

  let receiver, sender, token, transferAmount;

  before(async () => {
    let sentValue;
    receiver = await Token677ReceiverMock.deployed();
    sender = accounts[0];
    token = await SmartToken.deployed();
    transferAmount = 100;

    await token.transfer(sender, transferAmount);
    sentValue = await receiver.sentValue();
    assert.equal(sentValue.toString(), 0);
  });

  describe("#transferAndCall(address, uint, bytes)", () => {
    it("should transfer the tokens", async () => {
      let balance = await token.balanceOf.call(receiver.address);
      assert.equal(balance, 0);
    });

    it("should call the token fallback function on transfer", async () => {
      await token.transferAndCall(receiver.address, transferAmount, "0x15b");

      let calledFallback = await receiver.calledFallback();
      assert(calledFallback);

      let tokenSender = await receiver.tokenSender();
      assert.equal(tronWeb.address.fromHex(tokenSender), sender);

      let sentValue = await receiver.sentValue();
      assert.equal(sentValue, transferAmount);
    });

    it("should return true when the transfer succeeds", async () => {
      let success = await token.transferAndCall(
        receiver.address,
        transferAmount,
        "0x15b",
        { from: sender, shouldPollResponse: true }
      );
      assert(success);
    });

    it("should throw when the transfer fails", async () => {
      try {
        await token.transferAndCall(receiver.address, 100000, "0x15b", {
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

      it("throws an error", async () => {
        try {
          await token.transferAndCall(nonTRC677.address, 100, "0x15b");
          assert(
            false,
            "didn't throw in case of sending to TRC677 incompatiable"
          );
        } catch (error) {
          assert(error, "REVERT opcode executed");
        }

        let balance = await token.balanceOf.call(nonTRC677.address);
        assert.equal(balance, 0);
      });
    });
  });
});
