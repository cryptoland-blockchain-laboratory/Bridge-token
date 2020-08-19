var BridgeToken = artifacts.require("./BridgeToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BridgeToken);
};
