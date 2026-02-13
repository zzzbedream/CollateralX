// scripts/deploy.js
// CollateralX — Full deployment script
// Deploys: MockUSDC → MockNFT → LendingPool
//
// Usage:
//   npx hardhat run scripts/deploy.js --network localhost
//   npx hardhat run scripts/deploy.js --network arbitrumSepolia

const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("═══════════════════════════════════════════════════════");
    console.log("  CollateralX — Contract Deployment");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`  Deployer:  ${deployer.address}`);
    console.log(`  Network:   ${hre.network.name}`);
    console.log(`  Balance:   ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
    console.log("───────────────────────────────────────────────────────\n");

    // ── 1. Deploy MockUSDC ──────────────────────────────────────────────
    console.log("1/3  Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log(`     ✅ MockUSDC deployed at: ${usdcAddress}`);
    console.log(`     → Initial supply: 10,000,000 USDC\n`);

    // ── 2. Deploy MockNFT ───────────────────────────────────────────────
    console.log("2/3  Deploying MockNFT (CollateralX Asset)...");
    const MockNFT = await hre.ethers.getContractFactory("MockNFT");
    const nft = await MockNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`     ✅ MockNFT deployed at: ${nftAddress}\n`);

    // ── 3. Deploy LendingPool ───────────────────────────────────────────
    //
    // NOTE: The stylusValuator address should be the deployed Rust/WASM
    //       contract on Arbitrum. For local testing, we use the deployer
    //       address as a placeholder (calls to it will revert, but the
    //       contract deploys correctly). Replace with the real address
    //       after deploying via `cargo stylus deploy`.
    //
    const stylusValuator = process.env.STYLUS_VALUATOR_ADDRESS || deployer.address;

    console.log("3/3  Deploying LendingPool...");
    console.log(`     → stablecoin:      ${usdcAddress}`);
    console.log(`     → collateralNFT:   ${nftAddress}`);
    console.log(`     → stylusValuator:  ${stylusValuator}`);

    const LendingPool = await hre.ethers.getContractFactory("LendingPool");
    const pool = await LendingPool.deploy(usdcAddress, nftAddress, stylusValuator);
    await pool.waitForDeployment();
    const poolAddress = await pool.getAddress();
    console.log(`     ✅ LendingPool deployed at: ${poolAddress}\n`);

    // ── 4. Fund the LendingPool with USDC ───────────────────────────────
    const fundAmount = 5_000_000n * 10n ** 6n; // 5M USDC
    console.log("     Funding LendingPool with 5,000,000 USDC...");
    const tx = await usdc.transfer(poolAddress, fundAmount);
    await tx.wait();
    console.log("     ✅ Pool funded!\n");

    // ── Summary ─────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════════");
    console.log("  Deployment Summary");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`  MockUSDC:         ${usdcAddress}`);
    console.log(`  MockNFT:          ${nftAddress}`);
    console.log(`  LendingPool:      ${poolAddress}`);
    console.log(`  StylusValuator:   ${stylusValuator}`);
    console.log("───────────────────────────────────────────────────────");
    console.log(`  Pool Liquidity:   5,000,000 USDC`);
    console.log(`  LTV Ratio:        60%`);
    console.log("═══════════════════════════════════════════════════════\n");

    // ── Export addresses for frontend ───────────────────────────────────
    const deploymentData = {
        network: hre.network.name,
        deployer: deployer.address,
        contracts: {
            MockUSDC: usdcAddress,
            MockNFT: nftAddress,
            LendingPool: poolAddress,
            StylusValuator: stylusValuator,
        },
        timestamp: new Date().toISOString(),
    };

    const outputPath = "./deployments.json";
    fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    console.log(`  📄 Addresses saved to ${outputPath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
