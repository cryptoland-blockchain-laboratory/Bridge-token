pragma solidity ^0.5.8;

import '../BasicToken.sol';

contract BasicTokenMock is BasicToken {
    
    constructor(address initialAccount, uint256 initialBalance) public {
        _balances[initialAccount] = initialBalance;
        totalSupply = initialBalance;
    }
}