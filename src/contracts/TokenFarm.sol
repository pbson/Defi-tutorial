pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked; 
    mapping(address => bool) public isStaking; 

    constructor(DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    //1. Stake Tokens (deposit)
    function stakeTokens(uint256 _amount) public {
        //require amount > 0
        require(_amount > 0, "Amount must be greater than 0");

        //Transfer mDAI from staker to Token Farm
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //Update staking balance of staker
        stakingBalance[msg.sender] += _amount;

        //Add user to stakers list
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        //Update staker status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    //2. Issue Tokens ()
    function issueTokens() public onlyOwner{
        //Loop through all stakers
        for (uint i = 0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }

    //2. Unstaking Tokens (withdraw)
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        //check stakingBalance is greater than 0
        require(balance > 0, "You must have staked tokens to unstake");

        //unstakes tokens
        daiToken.transfer(msg.sender, balance);

        //reset stakingBalance
        stakingBalance[msg.sender] = 0;

        //set staking status to false
        isStaking[msg.sender] = false;
    }

}