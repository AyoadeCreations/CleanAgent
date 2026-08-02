// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Escrow
 * @notice Time-locked escrow with release conditions set by the orchestrator.
 * @dev Reference implementation for the CleanFlow MVP. The web app tracks escrow-style
 *      transactions as type ESCROW and enforces CCP decisions in lib/cleanverse/ccp.ts.
 */
contract Escrow {
    struct Deposit {
        address payer;
        address payable payee;
        address resolver; // allowed to release or refund
        uint256 amount;
        uint256 releasedAt;
        uint256 refundedAt;
    }

    address public immutable admin;

    mapping(bytes32 => Deposit) public deposits;
    uint256 public depositCount;

    event Deposited(bytes32 indexed depositId, address payer, address payee, uint256 amount);
    event Released(bytes32 indexed depositId);
    event Refunded(bytes32 indexed depositId);

    error NotAuthorized();
    error NotAdmin();
    error AlreadySettled();
    error NothingDeposited();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function deposit(address payable payee, address resolver) external payable returns (bytes32 depositId) {
        if (msg.value == 0) revert NothingDeposited();
        depositId = keccak256(abi.encodePacked(depositCount, block.number, msg.sender));
        deposits[depositId] = Deposit({
            payer: msg.sender,
            payee: payee,
            resolver: resolver,
            amount: msg.value,
            releasedAt: 0,
            refundedAt: 0
        });
        depositCount++;
        emit Deposited(depositId, msg.sender, payee, msg.value);
    }

    function release(bytes32 depositId) external {
        Deposit storage d = deposits[depositId];
        if (d.amount == 0) revert NothingDeposited();
        if (msg.sender != d.payer && msg.sender != d.resolver) revert NotAuthorized();
        if (d.releasedAt != 0 || d.refundedAt != 0) revert AlreadySettled();

        d.releasedAt = block.timestamp;
        d.payee.transfer(d.amount);
        emit Released(depositId);
    }

    function refund(bytes32 depositId) external {
        Deposit storage d = deposits[depositId];
        if (d.amount == 0) revert NothingDeposited();
        if (msg.sender != d.resolver) revert NotAuthorized();
        if (d.releasedAt != 0 || d.refundedAt != 0) revert AlreadySettled();

        d.refundedAt = block.timestamp;
        payable(d.payer).transfer(d.amount);
        emit Refunded(depositId);
    }
}
