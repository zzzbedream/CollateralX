const hre = require("hardhat");
async function main() {
    const usdc = await hre.ethers.getContractAt("MockUSDC", "0x265e31a371eFdDC5E6922E68dEaf5045E57f8429");
    const pool = "0xFc9f8c4107c6d4c2AFBdB7D25A30447FaB63b9bC";
    const bal = await usdc.balanceOf(pool);
    console.log("Pool USDC balance:", hre.ethers.formatUnits(bal, 6));
}
main().catch(console.error);
