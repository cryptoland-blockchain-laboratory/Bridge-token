pragma solidity ^0.5.8;

contract Token677ReceiverMock {
      address public tokenSender;
      uint256 public sentValue;
      bytes public tokenData;
      bool public calledFallback = false;

      function  onTokenTransfer(address _sender, uint _value, bytes memory _data) public {
        calledFallback = true;

        tokenSender = _sender;
        sentValue = _value;
        tokenData = _data;
     }
}