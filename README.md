# Colateral-X: SME Digital Collateralization on Arbitrum Stylus 🚜💸

> **Winner Track:** "Something entirely new" / DeFi
> **Stack:** Arbitrum Stylus (Rust), Solidity, React (Vite), Wagmi.

## 🚀 The Vision
**Unlocking $1.8T in SME liquidity using Rust-based RWA valuation on Arbitrum Stylus.**

In Latin America, SMEs are the economy's backbone but face a **$1.8 Trillion financing gap**. Why? Banks demand real estate collateral, but SMEs own movable assets (trucks, inventory). Existing DeFi cannot safely value these depreciating assets on-chain due to EVM gas limits on complex math.

**Colateral-X** is a mobile-first lending protocol. We use **Arbitrum Stylus** to run complex valuation models (written in Rust/WASM) that calculate asset depreciation and risk in real-time for <10% of the gas cost of Solidity. This allows instant, affordable, under-collateralized loans against real-world assets.

---

## 🏗️ Architecture & Why Stylus?

We chose **Arbitrum Stylus** because calculating real-time asset depreciation requires complex math that is inefficient in Solidity.

```mermaid
graph TD
    User((SME Owner))
    UI[Frontend DApp<br/>Mobile-First UI]
    LP[LendingPool.sol<br/>(Arbitrum EVM)]
    SV[StylusValuator.rs<br/>(Arbitrum WASM)]
    NFT[Asset NFT]
    USDC[USDC Token]

    User -->|Connect Wallet| UI
    UI -->|1. Approve NFT| NFT
    UI -->|2. Request Loan| LP
    LP -->|Transfer NFT| NFT
    LP -->|3. Get Valuation| SV
    SV --"Complex Risk Math<br/>(Rust/WASM)"--> LP
    LP -->|4. Payout Loan| USDC
    USDC -->|Transfer| User
```

| Feature | Standard EVM (Solidity) | Arbitrum Stylus (Rust) |
| :--- | :--- | :--- |
| **Risk Model** | Simple linear (unsafe) | Non-linear depreciation + Volatility adjustment |
| **Compute Cost** | High Gas (Expensive) | **~10x Cheaper (Native WASM)** |
| **Safety** | Overflow risks | Rust Memory Safety + Checked Arithmetic |

---

## 📂 Repository Structure

- `/stylus-core`: **Rust Smart Contracts**. Contains the valuation logic compiled to WASM.
- `/evm-contracts`: **Solidity Smart Contracts**. The `LendingPool` and Mock tokens (USDC/NFT).
- `/frontend`: **React DApp**. Mobile-first interface for the SME owner.

## 🛠️ Setup & Run

### Prerequisites
- Rust & Cargo Stylus
- Node.js & NPM
- An Arbitrum Sepolia Wallet

### 1. Stylus Contract (Rust)
```bash
cd stylus-core
cargo stylus check
# Deploy to Arbitrum Sepolia
cargo stylus deploy --private-key=<YOUR_KEY>
```

### 2. EVM Contracts (Solidity)
```bash
cd evm-contracts
npm install
# Deploy mocks and lending pool
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 License
MIT
