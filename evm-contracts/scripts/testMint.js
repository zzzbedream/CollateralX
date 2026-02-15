const hre = require("hardhat");
async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with:", deployer.address);

    const nft = await hre.ethers.getContractAt("MockNFT", "0xAb78688e3B83f56c58bDf7D2520F5cA590EcDB2d");

    // Check if tokenId 1 already exists
    try {
        const owner = await nft.ownerOf(1);
        console.log("Token #1 owner:", owner);
    } catch (e) {
        console.log("Token #1 does not exist yet (good)");
    }

    // Try minting tokenId 99 (unlikely to exist)
    console.log("\nAttempting mint(deployer, 99)...");
    try {
        const tx = await nft.mint(deployer.address, 99, { gasLimit: 300000 });
        console.log("TX hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("SUCCESS! Gas used:", receipt.gasUsed.toString());
        
        const owner = await nft.ownerOf(99);
        console.log("Token #99 owner:", owner);
    } catch (e) {
        console.log("MINT FAILED:", e.message?.substring(0, 300));
    }
}
main().catch(console.error);
