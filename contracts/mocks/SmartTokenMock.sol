pragma solidity ^0.5.8;

import "../SmartToken.sol";

contract SmartTokenMock is SmartToken {
    string public name = "Example TRC677 Token";
    string public symbol = "TRC677";
    uint public decimals = 6;
    
    constructor(uint256 _initialBalance) public {
        _balances[msg.sender] = _initialBalance;
        totalSupply = _initialBalance;
    }

} 