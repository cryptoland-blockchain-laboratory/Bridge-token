pragma solidity ^0.5.8;

import  "./Pauseable.sol";
import "./SafeMath.sol";

contract TRC20Basic {
    uint public totalSupply;
    function transfer(address to, uint256 value) public returns(bool);
    function balanceOf(address who) public view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ITRC20 is TRC20Basic {
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract ITRC677 is ITRC20 {
    function transferAndCall(address to, uint value, bytes memory data) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint value, bytes data);
}

contract TRC677Receiver {
    function onTokenTransfer(address _sender, uint _value, bytes memory _data) public;
}


contract BasicToken is TRC20Basic, Pauseable {
    using SafeMath for uint256;
    
    mapping(address => uint256) internal Frozen;
    
    mapping(address => uint256) internal _balances;
    
    function transfer(address to, uint256 value) public stoppable validRecipient(to) returns(bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function _transfer(address _from, address to, uint256 value) internal {
        require(value > 0);
        require(_balances[_from].sub(Frozen[_from]) >= value);
        _balances[_from] = _balances[_from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(_from, to, value);
    }

   function balanceOf(address _owner) public view returns (uint256) {
      return _balances[_owner];
    }
    function availableBalance(address _owner) external view returns(uint256) {
        return _balances[_owner].sub(Frozen[_owner]);
    }
    function frozenOf(address _owner) external view returns(uint256) {
        return Frozen[_owner];
    }

    modifier validRecipient(address _recipient) {
        require(_recipient != address(0) && _recipient != address(this));
    _;
    }
}
