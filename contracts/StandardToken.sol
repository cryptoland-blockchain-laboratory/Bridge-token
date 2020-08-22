pragma solidity 0.5.8;

import "./BasicToken.sol";

/**
 * @title ITRC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */

contract ITRC20 is TRC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function approve(address spender, uint256 value) public returns (bool);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title Standard token
 * @dev Enhanced Basic Token, with "allowance" possibility.
 */

contract StandardToken is ITRC20, BasicToken {

    mapping(address => mapping(address => uint256)) private _allowed;

    /**
     * @dev Approving an address to acquire allowance of spending a certain amount of tokens on behalf of msg.sender.
     * @param spender the address which will spend the funds.
     * @param value the amount of tokens to be spent.
     */

    function approve(address spender, uint256 value) public stoppable validRecipient(spender) returns(bool) {
        _approve(msg.sender, spender, value);
        return true;
    }
    
    function _approve(address _owner, address spender, uint256 value) private {
        _allowed[_owner][spender] = value;
        emit Approval(_owner, spender, value);
    }
    
    /**
     * @dev Transfer tokens from one address to another.
     * @param from the address which you want to send tokens from.
     * @param to the address which you want to transfer to.
     * @param value the amount of tokens to be transferred.
     */

     function transferFrom(address from, address to, uint256 value) public  stoppable validRecipient(to) returns(bool) {
        require(_allowed[from][msg.sender] >= value);
        _transfer(from, to, value);
        _approve(from, msg.sender, _allowed[from][msg.sender].sub(value));
        return true;
    }

    /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner the address which owns the funds.
   * @param _spender the address which is allowed to be able to spend the funds.
   * @return uint256 specifying the amount of tokens still available for the spender.
   */

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return _allowed[_owner][_spender];
    }
    
    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     * Requirements: `spender` cannot be the zero address.
     */

    function increaseAllowance(address spender, uint256 addedValue) public stoppable validRecipient(spender) returns(bool) {
        _approve(msg.sender, spender, _allowed[msg.sender][spender].add(addedValue));
        return true;
    }
    
    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     * Requirements: `spender` cannot be the zero address.
     */
    
    function decreaseAllowance(address spender, uint256 subtractValue) public stoppable validRecipient(spender) returns(bool) {
        uint256 oldValue = _allowed[msg.sender][spender];
        if(subtractValue > oldValue) {
            _approve(msg.sender, spender, 0);
        }
        else {
            _approve(msg.sender, spender, oldValue.sub(subtractValue));
        }
        return true;
    }

    /** @dev Creates "amount" tokens and assigns them to `account`, increasing
     *  the total supply.
     *  Emits a {Transfer} event with "from" set to the zero address.
     *  Requirements: "to" cannot be the zero address.
     */

    function mint(address account, uint256 amount) public onlyOwner stoppable validRecipient(account) returns(bool) {
        totalSupply = totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
        return true;
    }

    /**
     * @dev Destroys "amount" tokens from "account", reducing the
     * total supply.
     * Emits a {Transfer} event with "to" set to the zero address.
     * Requirements: "account" cannot be the zero address and must have at least "amount" tokens.
     */

    function burn(uint256 amount) public stoppable onlyOwner returns(bool) {
        require(amount > 0 && _balances[msg.sender] >= amount);
        totalSupply = totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

}