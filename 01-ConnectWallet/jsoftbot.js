const ethers = require('ethers');

const settings = require('./test-settings.json');

async function main() {
    const provider = new ethers.providers.WebSocketProvider(settings.wssAddr);
    const wallet = new ethers.Wallet(settings.private_key, provider);


    let balance = await wallet.getBalance();
    console.log("balance = " + ethers.utils.formatEther(balance));
    console.log(wallet.address);
}

main();