pragma solidity 0.5.8;

import "./Ownable.sol";

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifier `stoppable`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifier is put in place.
 */

contract Pauseable is Ownable {

    /**
     * @dev Emitted when the pause is triggered by `owner`.
     */

    event Stopped(address _owner);

    /**
     * @dev Emitted when the pause is lifted by `owner`.
     */

    event Started(address _owner);

    bool private stopped;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    
    constructor() internal {
        stopped = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */

    modifier stoppable {
        require(!stopped);
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */

    function paused() public view returns (bool) {
        return stopped;
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */

    function halt() public onlyOwner {
        stopped = true;
        emit Stopped(msg.sender);
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */

    function start() public onlyOwner {
        stopped = false;
        emit Started(msg.sender);
    }
}