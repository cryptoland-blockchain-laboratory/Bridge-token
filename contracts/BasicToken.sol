pragma solidity 0.5.8;

import  "./Pauseable.sol";
import "./SafeMath.sol";

/**
 * @title TRC20Basic
 * @dev Simpler version of TRC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */

contract TRC20Basic {
    uint public totalSupply;
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns(bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title Basic Token
 * @dev Basic version of Standard Token, with no allowances. 
 */

contract BasicToken is TRC20Basic, Pauseable {
    
    using SafeMath for uint256;
    
    mapping(address => uint256) internal Frozen;
    
    mapping(address => uint256) internal _balances;
    
    /**
     * @dev transfer token to a specified address
     * @param to The address to which tokens are transfered.
     * @param value The amount which is transferred.
     */
    
    function transfer(address to, uint256 value) public stoppable validRecipient(to) returns(bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0));
        require(value > 0);
        require(_balances[from].sub(Frozen[from]) >= value);
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev Gets the balance of a specified address.
     * @param _owner is the address to query the balance of. 
     * @return uint256 representing the amount owned by the address.
     */

   function balanceOf(address _owner) public view returns(uint256) {
      return _balances[_owner];
    }

    /**
     * @dev Gets the available balance of a specified address which is not frozen.
     * @param _owner is the address to query the available balance of. 
     * @return uint256 representing the amount owned by the address which is not frozen.
     */

    function availableBalance(address _owner) public view returns(uint256) {
        return _balances[_owner].sub(Frozen[_owner]);
    }

    /**
     * @dev Gets the frozen balance of a specified address.
     * @param _owner is the address to query the frozen balance of. 
     * @return uint256 representing the amount owned by the address which is frozen.
     */

    function frozenOf(address _owner) public view returns(uint256) {
        return Frozen[_owner];
    }

    /**
     * @dev a modifier to avoid a functionality to be applied on zero address and token contract.
     */

    modifier validRecipient(address _recipient) {
        require(_recipient != address(0) && _recipient != address(this));
    _;
    }
}
