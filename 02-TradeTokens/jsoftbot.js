const ethers = require('ethers');

const settings = require('./test-settings.json');

async function main() {
    const provider = new ethers.providers.WebSocketProvider(settings.wssAddr);
    const wallet = new ethers.Wallet(settings.private_key, provider);
    const account = wallet.connect(provider);

    const routerContract = new ethers.Contract(
            settings.pancake_router_address,
            [
                'function WETH() external pure returns (address)',
                'function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)',
                'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)  external  payable  returns (uint[] memory amounts)'
            ],
            account
    );

    let tokenSrc = await routerContract.WETH();       // This corresponds to BNB on the Binance smart chain
    let tokenDest = settings.BUSD;
    let tokenPair = [tokenSrc, tokenDest];

    // we pay 0.01 BNB
    const tokenAmountIn = ethers.utils.parseUnits('0.001', 'ether');
    let amounts = await routerContract.getAmountsOut(tokenAmountIn, tokenPair);
    const slippage = 10; // 10%
    const tokenAmountOutMin = amounts[1].sub(amounts[1].mul(slippage).div(100));

    let gasPrice = ethers.utils.parseUnits(`6`, 'gwei');

    const swapTx = await routerContract.swapExactETHForTokens(
            tokenAmountOutMin,
            tokenPair,
            wallet.address,
            Date.now() + 1000 * 60 * 10,
            {
                'gasLimit': 250000,
                'gasPrice': gasPrice,
                'value': tokenAmountIn
            }
    )

    let receipt = await swapTx.wait();
    console.log(`Transaction details : https://testnet.bscscan.com/tx/${receipt.logs[1].transactionHash}`);
}

main();