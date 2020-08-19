pragma solidity ^0.5.8;

import "./Ownable.sol";

contract Pauseable is Ownable { 
    bool internal stopped;

    modifier stoppable {
        require(!stopped);
        _;
    }

    function paused() public view returns (bool) {
        return stopped;
    }

    function stop() external onlyOwner {
        stopped = true;
    }

    function start() external onlyOwner {
        stopped = false;
    }
}