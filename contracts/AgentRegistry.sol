// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentRegistry
 * @notice On-chain registry of autonomous payment agents with enforced spending limits.
 * @dev Reference implementation for the CleanFlow MVP. The web app enforces the same
 *      limits in lib/cleanverse/ccp.ts and app/api/transaction/create/route.ts.
 */
contract AgentRegistry {
    struct Agent {
        address owner;
        address payable wallet;
        uint256 dailyLimit; // in base units
        uint256 monthlyLimit; // in base units
        bool active;
        uint64 createdAt;
    }

    address public immutable admin;

    mapping(bytes32 => Agent) public agents; // keyed by agentId
    mapping(address => Agent) private _byWallet;
    mapping(bytes32 => uint256) public spentDay;
    mapping(bytes32 => uint256) public spentMonth;

    event AgentRegistered(bytes32 indexed agentId, address owner, address wallet);
    event AgentUpdated(bytes32 indexed agentId);
    event SpendRecorded(bytes32 indexed agentId, uint256 amount);

    error NotAdmin();
    error AgentNotFound();
    error AgentInactive();
    error DailyLimitExceeded(uint256 daily, uint256 projected);
    error MonthlyLimitExceeded(uint256 monthly, uint256 projected);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerAgent(
        bytes32 agentId,
        address owner,
        address payable wallet,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external onlyAdmin {
        Agent storage agent = agents[agentId];
        agent.owner = owner;
        agent.wallet = wallet;
        agent.dailyLimit = dailyLimit;
        agent.monthlyLimit = monthlyLimit;
        agent.active = true;
        agent.createdAt = uint64(block.timestamp);
        _byWallet[wallet] = agent;
        emit AgentRegistered(agentId, owner, wallet);
    }

    function setActive(bytes32 agentId, bool active) external onlyAdmin {
        if (agents[agentId].owner == address(0)) revert AgentNotFound();
        agents[agentId].active = active;
        emit AgentUpdated(agentId);
    }

    /// @notice Record a spend against an agent, enforcing rolling daily/monthly limits.
    /// @param resetDay/resetMonth should be true when the bucket period has rolled over.
    function recordSpend(
        bytes32 agentId,
        uint256 amount,
        bool resetDay,
        bool resetMonth
    ) external onlyAdmin {
        Agent storage agent = agents[agentId];
        if (agent.owner == address(0)) revert AgentNotFound();
        if (!agent.active) revert AgentInactive();

        if (resetDay) spentDay[agentId] = 0;
        if (resetMonth) spentMonth[agentId] = 0;

        uint256 projectedDay = spentDay[agentId] + amount;
        uint256 projectedMonth = spentMonth[agentId] + amount;

        if (agent.dailyLimit > 0 && projectedDay > agent.dailyLimit) {
            revert DailyLimitExceeded(agent.dailyLimit, projectedDay);
        }
        if (agent.monthlyLimit > 0 && projectedMonth > agent.monthlyLimit) {
            revert MonthlyLimitExceeded(agent.monthlyLimit, projectedMonth);
        }

        spentDay[agentId] = projectedDay;
        spentMonth[agentId] = projectedMonth;
        emit SpendRecorded(agentId, amount);
    }

    function agentByWallet(address wallet) external view returns (bytes32 agentId, Agent memory agent) {
        agent = _byWallet[wallet];
        if (agent.owner == address(0)) revert AgentNotFound();
    }
}
