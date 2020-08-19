pragma solidity ^0.5.8;

import "./BasicToken.sol";


contract StandardToken is ITRC20, BasicToken {

    mapping(address => mapping(address => uint256)) private _allowed;


    function transferFrom(address _from, address to, uint256 value) external  stoppable validRecipient(to) returns(bool) {
        require(_allowed[_from][msg.sender] >= value);
        _transfer(_from, to, value);
        _allowed[_from][msg.sender] = _allowed[_from][msg.sender].sub(value);
        return true;
    }

    function approve(address spender, uint256 value) external stoppable validRecipient(spender) returns(bool) {
        _approve(msg.sender, spender, value);
        return true;
    }
    
    function _approve(address _owner, address spender, uint256 value) private {
        _allowed[_owner][spender] = value;
        emit Approval(_owner, spender, value);
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        return _allowed[_owner][_spender];
    }
    
    function increaseAllowance(address spender, uint256 addedValue) external stoppable validRecipient(spender) returns(bool) {
        require(_allowed[msg.sender][spender] > 0);
        _allowed[msg.sender][spender] = _allowed[msg.sender][spender].add(addedValue);
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }
    
    
    function decreaseAllowance(address spender, uint256 subtractValue) external stoppable validRecipient(spender) returns(bool) {
        require(_allowed[msg.sender][spender] > 0);
        uint256 oldValue = _allowed[msg.sender][spender];
        if(subtractValue > oldValue) {
            _allowed[msg.sender][spender] = 0;
        }
        else {
            _allowed[msg.sender][spender] = oldValue.sub(subtractValue);
        }
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }
}

contract SmartToken is ITRC677, StandardToken {
    function transferAndCall(address _to, uint _value, bytes memory _data) public returns(bool success) {
        transfer(_to, _value);
        emit Transfer(msg.sender, _to, _value, _data);
        if (isContract(_to)) {
            contractFallback(_to, _value, _data);
        }
        return true;
    }

    function contractFallback(address _to, uint _value, bytes memory _data) private {
    TRC677Receiver receiver = TRC677Receiver(_to);
    receiver.onTokenTransfer(msg.sender, _value, _data);
  }

    function isContract(address _addr) private view returns (bool hasCode) {
    uint length;
    assembly { length := extcodesize(_addr) }
    return length > 0;
  }
}
