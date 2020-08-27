pragma solidity ^0.5.8;

import {ITRC20} from "../StandardToken.sol";


contract BrgReceiver {

    bool public fallbackCalled;
    bool public callDataCalled;
    uint public tokensReceived;


  function onTokenTransfer(address _from, uint _amount, bytes memory _data)
  public returns (bool success) {
    fallbackCalled = true;
    if (_data.length > 0) {}
    return true;
  }
}