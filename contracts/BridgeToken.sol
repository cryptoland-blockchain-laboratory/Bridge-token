pragma solidity ^0.5.8;

import "./SmartToken.sol";

contract BridgeToken is SmartToken {
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    
    constructor() public {
        _name = "BridgeToken";
        _symbol = "BRG";
        _decimals = 6;
        totalSupply = 10000000000e6;
        _balances[msg.sender] = totalSupply;
        stopped = false;
    }

    /**
     * @dev Returns name of the token.
    */
    function name() public view returns(string memory) {
        return _name;
    }

    /**
     * @dev Returns symbol of the token.
    */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }
    
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 value);
    
    
    event Freeze(address indexed from, address indexed to, uint256 value);
    event Melt(address indexed from ,address indexed to, uint256 value);
    
    function freeze(address to, uint256 value) external onlyOwner stoppable validRecipient(to) returns(bool) {
        _freeze(msg.sender, to, value);
        return true;
    }


    function _freeze(address _from, address to, uint256 value) private {
        require(value > 0);
        require(_balances[_from] >= value);
        _balances[_from] = _balances[_from].sub(value);
        Frozen[to] = Frozen[to].add(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(_from, to, value);
        emit Freeze(_from ,to, value);
    }
    
    function melt(address to, uint256 value) external  onlyOwner stoppable  validRecipient(to) returns(bool) {
        _melt(msg.sender, to, value);
        return true;
    }
    
    function _melt(address _from, address to, uint256 value) private {
        require(Frozen[to] >= value);
        Frozen[to] = Frozen[to].sub(value);
        emit Melt(_from, to, value);
    }
    
    function mint(address _to, uint256 _amount) external onlyOwner stoppable validRecipient(_to) returns(bool) {
        require(_amount > 0);
        totalSupply = totalSupply.add(_amount);
        _balances[_to] = _balances[_to].add(_amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }
    
    function burn(uint256 _value) external stoppable onlyOwner returns(bool) {
        require(_value > 0 && _balances[msg.sender] >= _value);
        _balances[msg.sender] = _balances[msg.sender].sub(_value);
        totalSupply = totalSupply.sub(_value);
        emit Burn(msg.sender, _value);
        return true;
    }
    
}