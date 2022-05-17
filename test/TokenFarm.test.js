const { assert } = require('chai');

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        //Transfer all tokens to TokenFarm contract
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));

        //Transfer some daiToken to a Mock investor
        await daiToken.transfer(investor, tokens('100'), { from: owner });
    })

    describe('mockDai Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token Deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm Deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contracts has token', async () => {
            const balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe("Farming tokens", async() => {
        it("rewards investors for staking mDai Tokens", async() => { 
            let result;
            //check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result, tokens('100'), "Investor has 100 mDai Tokens before staking");

            //stake 100 mDai tokens
            await daiToken.approve(tokenFarm.address,tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), { from: investor });

            //check investor balance after staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result, tokens('0'), "Investor has 0 mDai Tokens after staking");

            //check tokenFarm balance after staking
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result, tokens('100'), "TokenFarm has 100 mDai Tokens after staking");

            //Issue Token
            await tokenFarm.issueTokens({ from: owner });

            //Check investor balance after issuing tokens
            result = await dappToken.balanceOf(investor);
            assert.equal(result, tokens('100'), "Investor has 100 DApp Tokens after issuing tokens");

            //Check issueToken can only be called by owner
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            //unstake 100 mDai tokens
            await tokenFarm.unstakeTokens({ from: investor });

            //Check if investor has 100 mDai Tokens after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result, tokens('100'), "Investor has 100 mDai Tokens after unstaking");

            //Check if tokenFarm has 0 mDai Tokens after unstaking
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result, tokens('0'), "TokenFarm has 0 mDai Tokens after unstaking");
        })
    })

})
