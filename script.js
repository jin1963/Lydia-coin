
let contractAddress = "0x8cede102e2ce12aed631f51fcec30db6d4ad93f2";
let abi = [{"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "calculateReward", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "lockDuration", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "stakingBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "getUnlockTime", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "rewardPool", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}];

let provider;
let signer;
let contract;

async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        document.getElementById("status").innerText = "🟢 Wallet connected";
        updateData();
    } else {
        alert("Please install MetaMask");
    }
}

document.getElementById('connectButton').onclick = connectWallet;

async function stakeTokens() {
    const amount = document.getElementById("amount").value;
    if (!amount || amount <= 0) {
        alert("Please enter amount to stake");
        return;
    }
    try {
        const tx = await contract && contract.stake(ethers.utils.parseEther(amount));
        await tx.wait();
        alert("✅ Stake successful!");
        updateData();
    } catch (err) {
        alert("❌ Error staking: " + err.message);
    }
}

async function claimRewards() {
    try {
        const tx = await contract && contract.claimReward();
        await tx.wait();
        alert("✅ Rewards claimed!");
        updateData();
    } catch (err) {
        alert("❌ Error claiming: " + err.message);
    }
}

async function withdrawTokens() {
    try {
        const tx = await contract && contract.withdraw();
        await tx.wait();
        alert("✅ Withdraw successful!");
        updateData();
    } catch (err) {
        alert("❌ Error withdrawing: " + err.message);
    }
}

async function updateData() {
    try {
        const address = await signer.getAddress();
        const reward = await contract && contract.calculateReward({ from: address });
        const unlockTime = await contract && contract.getUnlockTime({ from: address });
        const now = Math.floor(Date.now() / 1000);
        const remaining = unlockTime - now;

        document.getElementById("reward").innerText = "💰 Pending Rewards: " + ethers.utils.formatEther(reward) + " LYDIA";

        if (remaining > 0) {
            startCountdown(remaining);
        } else {
            document.getElementById("countdown").innerText = "⏱ Unlocked";
        }
    } catch (err) {
        console.error("Error loading data", err);
    }
}

function startCountdown(seconds) {
    let countdown = seconds;
    function updateCountdown() {
        const d = Math.floor(countdown / (3600 * 24));
        const h = Math.floor((countdown % (3600 * 24)) / 3600);
        const m = Math.floor((countdown % 3600) / 60);
        const s = countdown % 60;
        document.getElementById("countdown").innerText = `⏳ Unlocks in: ${d}d ${h}h ${m}m ${s}s`;
        if (countdown > 0) {
            countdown--;
            setTimeout(updateCountdown, 1000);
        }
    }
    updateCountdown();
}
