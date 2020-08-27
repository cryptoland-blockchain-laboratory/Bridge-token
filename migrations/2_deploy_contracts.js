var BridgeToken = artifacts.require("./BridgeToken.sol");
var OwnableMock = artifacts.require("./OwnableMock.sol");
var BasicTokenMock = artifacts.require("./BasicTokenMock.sol");
var Token677ReceiverMock = artifacts.require("./Token677ReceiverMock.sol");
var NotTRC677Compatible = artifacts.require("./NotTRC677Compatible.sol");
var BrgReceiver = artifacts.require("./BrgReceiver.sol");
var SmartTokenMock = artifacts.require("./SmartTokenMock.sol");

var StandardTokenMock = artifacts.require("./StandardTokenMock.sol");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(BridgeToken);

  deployer.deploy(BrgReceiver);
  deployer.deploy(NotTRC677Compatible);
  deployer.deploy(BasicTokenMock, accounts, 100);
  deployer.deploy(Token677ReceiverMock);
  deployer.deploy(SmartTokenMock, 1000);
  deployer.deploy(StandardTokenMock, accounts, 100);

  deployer.deploy(OwnableMock);
};
