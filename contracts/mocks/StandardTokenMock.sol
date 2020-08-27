pragma solidity ^0.5.8;

import "../StandardToken.sol";

contract StandardTokenMock is StandardToken {
    
    constructor(address initialAccount, uint initialBalance) public {
        _balances[initialAccount] = initialBalance;
        totalSupply = initialBalance;
    }

}