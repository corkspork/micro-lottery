// SPDX-License-Identifier: UNLICENSED

// solhint-disable-next-line compiler-version
pragma solidity 0.8.11;

import "./utils/RateLimited.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract MicroLottery is RateLimited, PullPayment, VRFConsumerBase {
    enum ParticipationState {
        WAITING_FOR_RESULT,
        WIN,
        LOSS
    }

    struct Participation {
        address participant; // The address of the user
        uint256 timestamp; // The timestamp for the participation
        ParticipationState state; // The state of the participation
        uint256 potBalance; // The size of the pot when the participation happened
        bytes32 vrfRequestId; // The requestId for the random request done to VRF
        uint256 vrfResult; // The result returned by VRF
    }

    event NewParticipation(uint256 indexed participationId);
    event NewLoss(uint256 indexed participationId);
    event NewWin(uint256 indexed participationId);

    /**
     * VRFConsumerBase Variables
     */
    bytes32 internal _keyHash;
    uint256 internal _fee;

    uint256 public potBalance;

    uint256 public weiFee = 1000000000000000 wei; // 0.001 ether
    uint256 public winProbabilityPercentage = 20;

    Participation[] private _participations;
    mapping(bytes32 => uint256) private _vrfRequestIDTracker;

    /**
     * Constructor inherits VRFConsumerBase
     */
    constructor(
        address vrfCoordinator,
        address link,
        bytes32 keyHash,
        uint256 fee
    )
        VRFConsumerBase(
            vrfCoordinator, // VRF Coordinator
            link // LINK Token
        )
    {
        _keyHash = keyHash;
        _fee = fee; // LINK fee
    }

    function setWeiFee(uint256 _weiFee) public onlyOwner {
        console.log("setWeiFee: BEGIN");
        console.log("setWeiFee: _msgSender %s", _msgSender());

        weiFee = _weiFee;
        console.log("setWeiFee: weiFee changed to %s", weiFee);
    }

    function setWinProbabilityPercentage(uint256 _winProbabilityPercentage)
        public
        onlyOwner
    {
        console.log("winProbabilityPercentage: BEGIN");
        console.log("winProbabilityPercentage: _msgSender %s", _msgSender());

        console.log(
            "winProbabilityPercentage: set winProbabilityPercentage to %s",
            winProbabilityPercentage
        );
        winProbabilityPercentage = _winProbabilityPercentage;
    }

    function participationCount() public view returns (uint256) {
        console.log("participationCount: BEGIN");
        console.log("participationCount: _msgSender %s", _msgSender());

        return _participations.length;
    }

    function getAllParticipations()
        public
        view
        returns (Participation[] memory)
    {
        console.log("getAllParticipations: BEGIN");
        console.log("getAllParticipations: _msgSender %s", _msgSender());

        return _participations;
    }

    function getParticipationById(uint256 _id)
        public
        view
        returns (Participation memory)
    {
        console.log("getParticipationById: BEGIN");
        console.log("getParticipationById: _msgSender %s", _msgSender());

        return _participations[_id];
    }

    function participate() public payable rateLimited {
        console.log("participate: BEGIN");
        console.log("participate: _msgSender %s", _msgSender());

        // Contribute to the pot
        require(msg.value == weiFee, "Must pay the weiFee");
        require(
            LINK.balanceOf(address(this)) >= _fee,
            "Not enough LINK - fill contract"
        );

        potBalance += msg.value;
        console.log(
            "participate: %s added to potBalance. Total %s",
            msg.value,
            potBalance
        );

        // ask VRF for to assign the user a random number
        bytes32 requestId = requestRandomness(_keyHash, _fee);

        // add to list of _participations
        _participations.push(
            Participation(
                msg.sender,
                // solhint-disable-next-line not-rely-on-time
                block.timestamp,
                ParticipationState.WAITING_FOR_RESULT,
                potBalance,
                requestId,
                0
            )
        );
        _vrfRequestIDTracker[requestId] = participationCount() - 1;

        // Send NewParticipation event
        emit NewParticipation(_vrfRequestIDTracker[requestId]);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    // solhint-disable-next-line private-vars-leading-underscore
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        console.log("fulfillRandomness: BEGIN");
        console.log("fulfillRandomness: _msgSender %s", _msgSender());

        console.log("fulfillRandomness: requestId ");
        console.logBytes32(requestId);
        console.log("fulfillRandomness: randomness: %s", randomness);

        _participations[_vrfRequestIDTracker[requestId]].vrfResult = randomness;

        uint256 randomResult = randomness % 100;
        console.log("fulfillRandomness: randomResult %s", randomResult);

        if (randomResult <= winProbabilityPercentage) {
            console.log(
                "fulfillRandomness: set participation %s state as WIN",
                _vrfRequestIDTracker[requestId]
            );

            _participations[_vrfRequestIDTracker[requestId]]
                .state = ParticipationState.WIN;

            console.log(
                "fulfillRandomness: send potBalance of %s to %s",
                potBalance,
                _participations[_vrfRequestIDTracker[requestId]].participant
            );

            _asyncTransfer(
                _participations[_vrfRequestIDTracker[requestId]].participant,
                potBalance
            );

            uint256 newBalance = potBalance -
                _participations[_vrfRequestIDTracker[requestId]].potBalance;

            console.log(
                "fulfillRandomness: set new potBalance to %s",
                newBalance
            );

            potBalance = newBalance;

            // Send NewWin event
            emit NewWin(_vrfRequestIDTracker[requestId]);
            return;
        }

        console.log(
            "fulfillRandomness: set participation %s state as LOSS",
            _vrfRequestIDTracker[requestId]
        );
        _participations[_vrfRequestIDTracker[requestId]]
            .state = ParticipationState.LOSS;

        // Send NewWin event
        emit NewLoss(_vrfRequestIDTracker[requestId]);
    }

    function withdrawLink() external onlyOwner {
        console.log("withdrawLink: BEGIN");
        console.log("withdrawLink: _msgSender %s", _msgSender());

        require(
            LINK.transfer(msg.sender, LINK.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
