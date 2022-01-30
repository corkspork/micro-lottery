// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract RateLimited is Ownable {
    mapping(address => uint256) private userLastAction_;
    uint256 public rateLimit = 1;

    function setRateLimit(uint256 _rateLimit) public onlyOwner {
        rateLimit = _rateLimit;
    }

    modifier rateLimited() {
        address sender = _msgSender();
        require(
            block.number - rateLimit >= userLastAction_[sender],
            "Rate Limited. Must wait"
        );
        userLastAction_[sender] = block.number;
        _;
    }
}
