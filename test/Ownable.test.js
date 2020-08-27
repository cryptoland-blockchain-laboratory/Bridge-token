const { assert } = require("chai");

const wait = require("./helpers/wait.js");

var OwnableMock = artifacts.require("./OwnableMock.sol");

contract("OwnableMock", (accounts) => {
  let initialtoken, token;

  describe("Ownable", function () {
    const _owner = accounts[0];

    before(async function () {
      token = await OwnableMock.deployed();
      wait(3);
    });

    it("should have an owner", async () => {
      const owner = await token.owner();
      assert.equal(_owner, tronWeb.address.fromHex(owner));
    });

    it("should change owner after transfer ownership", async function () {
      return new Promise(async (resolve, reject) => {
        try {
          const owner = await token.owner();
          assert.equal(_owner, tronWeb.address.fromHex(owner));
          const _token = await tronWeb.contract().at(token.address);
          const watcher = await _token
            .OwnershipTransferred()
            .watch(async (err, res) => {
              if (err) throw err;
              if (res) {
                assert.equal(res.name, "OwnershipTransferred");
                assert.equal(
                  res.result.previousOwner,
                  tronWeb.address.toHex(_owner)
                );
                assert.equal(
                  res.result.newOwner,
                  tronWeb.address.toHex(accounts[3])
                );

                watcher.stop();
                resolve();
              }
            });
          await token.transferOwnership(accounts[3], { from: _owner });
          wait(3);
          const new_owner = await token.owner();
          assert.equal(accounts[3], tronWeb.address.fromHex(new_owner));
        } catch (e) {
          reject(e);
        }
      });
    });

    it("should prevent non-owners from transfering ownership", async function () {
      try {
        await token.transferOwnership(accounts[4], {
          from: accounts[5],
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of trasferring ownership by non-owner address"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });

    it("should prevent from transferring ownership to an empty address", async function () {
      try {
        await token.transferOwnership(null, { from: accounts[0] });
        assert(
          false,
          "didn't throw in case of transferring ownership to an empty address"
        );
      } catch (error) {
        assert.equal(error.reason, "invalid address");
      }
    });

    it("should lose owner after renouncement", async function () {
      return new Promise(async (resolve, reject) => {
        try {
          const owner = await token.owner();
          assert.notEqual(tronWeb.address.fromHex(owner), accounts[9]);

          assert.equal(tronWeb.address.fromHex(owner), accounts[3]);

          const _token = await tronWeb.contract().at(token.address);
          const watcher = await _token
            .OwnershipRenounced()
            .watch(async (err, res) => {
              if (err) throw err;
              if (res) {
                assert.equal(res.name, "OwnershipRenounced");
                assert.equal(
                  tronWeb.address.toHex(res.contract),
                  token.address
                );
                assert.equal(
                  tronWeb.address.fromHex(res.result.previousOwner),
                  accounts[3]
                );

                watcher.stop();
                resolve();
              }
            });

          await token.renounceOwnership({ from: accounts[3] });
          wait(3);
          const owner3 = await token.owner();
          assert.notEqual(owner3, tronWeb.address.toHex(accounts[3]));

          const read_owner = await token.owner();
          assert.equal(
            read_owner,
            "410000000000000000000000000000000000000000"
          );
        } catch (e) {
          reject(e);
        }
      });
    });

    it("should prevent non-owners from renouncing ownership", async () => {
      try {
        await token.renounceOwnership({
          from: accounts[5],
          shouldPollResponse: true,
        });
        assert(
          false,
          "didn't throw in case of renouncing ownership by non-owner address"
        );
      } catch (error) {
        assert.equal(error, "REVERT opcode executed");
      }
    });
  });
});
