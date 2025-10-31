# Mavuno
Selected Hackathon Track:
Onchain Finance & RWA (Track 1)
---

**Mavuno empowers farmers  farmers through community-backed micro-lending on Hedera Hashgraph**

Mavuno is a digital lending platform built for farmers in Africa. Unlike traditional banks or crypto platforms that demand heavy collateral, Mavuno uses a simple community pledge system. Farmers don't have to lock up land, titles, assets, or large savings. Instead, friends, family, or supporters can pledge funds on their behalf in HBAR. This makes it possible for farmers to access small loans in their local currency that can go straight to their bank accounts or ATM cards without necessarily dealing with the complexity of cryptocurrency or web3 wallets.

The goal is to make credit fair, transparent, accessible, and designed for real-world agricultural needs while enabling global pledgers to support local farmers.

---

## Hedera Integration Summary

Mavuno integrates **Hedera Hashgraph** as its primary distributed ledger for managing lending, pledging, and farmer registration. The platform leverages the **Hedera Token Service (HTS)** and **Hedera Smart Contracts (Solidity)** to ensure transparency, immutability, and high-speed financial interactions between farmers, pledgers, and liquidity providers.

By building on Hedera, Mavuno benefits from **low transaction fees**, **carbon-negative consensus**, and **finality within seconds**, making it an ideal infrastructure for agricultural micro-lending in emerging markets.

---
## Setup Steps
* **UI (React App) - Local Development**
Follow the steps below to run the project locally:
1. Clone the repository
   ```bash
   git clone https://github.com/Shunlexxi/mavuno.git
2. Navigate into the project directory
   ```bash
   cd ui
3. Install dependencies
   ```bash
   npm install
4. Create a .env file
   ```bash
   code .env
5. Set environment variables
   ```bash
   VITE_ADMIN_PK=<enter value>
   VITE_FB_API_KEY=<enter value>
   VITE_FB_APP_ID=<enter value>
   VITE_FB_AUTH_DOMAIN=<enter value>
   VITE_FB_MEASUREMENT_ID=<enter value>
   VITE_FB_MESSAGING_SENDER_ID=<enter value>
   VITE_FB_PROJECT_ID=<enter value>
   VITE_FB_STORAGE_BUCKET=<enter value>
   VITE_PAYSTACK_PK_KEY=<enter value>
   VITE_REOWN_PROJECT_ID=<enter value>
   VITE_PINATA_JWT=<enter value>
   VITE_PINATA_GATEWAY=<enter value>
6. Run the development server
   ```bash
   npm run dev
7. Visit the app
Open your browser and go to: http://localhost:5173 (or the port shown in your terminal)

* **Deploy Smart Contracts**
Follow the steps below to deploy the smart contracts to the testnet:
1. Clone the repository (if you cloned previously, skip)
   ```bash
   git clone https://github.com/Shunlexxi/mavuno.git
2. Navigate into the blockchain directory (assumption: you are not in the ui directory. If not, change directory)
   ```bash
   cd ../blockchain
3. Install dependencies
   ```bash
   npm install
4. Create a .env file
   ```bash
   code .env
5. Set environment variables
   ```bash
   HEDERA_PRIVATE_KEY=<enter value>
6. Deploy the contracts to the testnet
   ```bash
   npx hardhat run scripts/deploy.ts --network testnet
7. View deployment logs (Example)
   ```bash
   Deploying contracts...
   ...
   Deployment successful!
---
### Transaction Types

The following categories of on-chain transactions occur within the Mavuno ecosystem:

#### a. Farmer Registration
- Triggered when a farmer registers through the **FarmerRegistry** contract.  
- The contract deploys a new **PledgeManager** specific to that farmer.  
- Includes the upload of off-chain metadata (e.g., farmer profile, documents) to **IPFS**, with the URI stored on-chain.

#### b. Pledging Transactions
- Pledgers send **HBAR** to a farmer’s PledgeManager contract.  
- In return, they receive **fLP tokens** (Farmer Liquidity Pledge tokens).  
- The contract records the transaction, ensuring both transparency and traceability.

#### c. Borrowing & Repayment
- Farmers borrow tokenized fiat against their pledges through the **LendingPool** contract.  
- Borrowing transactions involve smart contract calls that calculate Loan-to-Value (LTV), interest, and repayment schedules.  
- Repayments trigger events that adjust the debt and release pledged assets accordingly.

#### d. Liquidity Provision
- Liquidity Providers deposit stable assets (tokenized fiat) into the **LendingPool**.  
- They receive **pLP tokens** representing their stake in the pool.  
- Withdrawals burn pLP tokens and release liquidity proportionally.

#### e. Liquidation
- Automatically triggered when a farmer’s **health factor** falls below 96%.  
- The LendingPool calls the PledgeManager to seize pledged HBAR and repay outstanding debt.  
- Maintains protocol solvency and ensures fairness for lenders.

---

## Contract Architecture

The Mavuno protocol is powered by three core contracts:

1. **FarmerRegistry** – Registers farmers and deploys their personal `PledgeManager`.
2. **PledgeManager** – Manages pledges of HBAR for each farmer.
3. **LendingPool** – Handles liquidity pools, borrowing, repayment, and liquidation.

![Mavuno Flow Diagram](assets/mavuno-flow-diagram.jpg)

Figure: High-level flow — farmers register via FarmerRegistry which deploys per-farmer PledgeManagers; pledgers stake HBAR into PledgeManagers and receive fLP; LendingPool supplies/borrows tokenized fiat, interacts with PledgeManagers for liquidation; off-chain services (IPFS profiles, Paystack on/off-ramp, Firebase/The Graph indexing) support the flow.

---

### Economic Justification

The decision to integrate Hedera Hashgraph is guided by the following economic considerations:

| Factor | Hedera Advantage | Mavuno Benefit |
|--------|------------------|----------------|
| **Transaction Cost** | ~$0.0001 per transaction | Enables micro-loans without overhead |
| **Speed & Finality** | ~3–5 seconds | Real-time lending and repayment confirmations |
| **Scalability** | 10,000+ TPS | Supports large-scale community pledging |
| **Energy Efficiency** | Carbon-negative | Aligns with Mavuno’s sustainability mission |
| **Stable Governance** | Hedera Council (Google, IBM, etc.) | Ensures long-term network reliability |

This cost structure ensures Mavuno can scale to thousands of farmers while maintaining operational viability, even for small loan amounts under $10.

---

## Contract Details

### 1. FarmerRegistry.sol

Registers farmers on-chain and links them to their off-chain profile (stored on IPFS). Each farmer automatically gets their own `PledgeManager` contract for handling pledges.

**Key Features**

* Register farmer profiles with IPFS metadata.
* Deploys a dedicated `PledgeManager` for each farmer.
* Maintains mapping of farmers → managers.
* Supports admin overrides for emergency profile updates.

**Events**

* `FarmerRegistered(address farmer, address pool, string profileUri, address manager)`
* `FarmerUpdated(address farmer, string profileUri)`

---

### 2. PledgeManager.sol

A **per-farmer contract** where pledgers stake HBAR in return for LP tokens (`fLP`). Farmers can activate or deactivate pledges, and liquidation flows through this contract.

**Key Features**

* Pledgers deposit HBAR → receive `fLP` tokens.
* Farmers can deactivate pledges, enabling withdrawal by pledgers.
* LendingPool can liquidate collateral if a farmer’s loan health is below threshold.
* Farmer can perform emergency withdrawals if no active loans exist.

**Events**

* `Pledged(address pledger, uint256 amount)`
* `Withdrawn(address pledger, uint256 amount)`
* `Liquidated(address farmer, address liquidator, uint256 amount)`
* `ActiveStatusChanged(bool active)`

---

### 3. LendingPool.sol

Handles all liquidity, loans, and repayments for a specific fiat-backed pool. Farmers borrow tokenized fiat against their pledges. LPs provide liquidity and earn interest.

**Key Features**

* **Liquidity Providers:**

  * `supply(amount, behalfOf)` – Deposit fiat, mint pool LP tokens (`pLP`).
  * `withdraw(amount)` – Burn `pLP` to withdraw fiat.
* **Borrowers (Farmers):**

  * `borrow(amount)` – Borrow fiat against pledges.
  * `repay(amount, behalfOf)` – Repay debt and accrued interest.
* **Liquidation:**

  * `liquidate(farmer)` – Triggered when health factor < threshold (96%).
  * Calls the farmer’s `PledgeManager` to seize pledged HBAR.
* **Parameters:**

  * Loan-to-Value (LTV): 70%
  * Borrow rate: 24% APR (2,400 BPS)
  * Liquidation threshold: 96%

**Events**

* `Supplied(address user, int64 amount, uint256 minted)`
* `Withdrawn(address user, int64 amount, uint256 burned)`
* `Borrowed(address farmer, int64 amount, int64 newPrincipal)`
* `Repaid(address farmer, int64 amount, int64 remaining, int64 interestPaid)`

---

## Key Features Recap

* Community-backed pledging instead of collateral.
* Undercollateralized loans in tokenized local fiat.
* Direct bank/ATM access for farmers.
* Immutable, corruption-resistant, and transparent.
* Farmers can publish timelines and updates to attract pledgers.
* Farmers may set rewards for pledgers.

---

## Business Model

* **Protocol fees:** Small % of interest paid back in pools.
* **On/off-ramp fees:** Small fee for converting tokenized fiat.

---

## Tech Stack

* **Smart Contracts:** Solidity, Hedera Token Service, OpenZeppelin
* **Frontend:** React + TypeScript
* **Storage:** IPFS (farmer profiles)
* **Backend/Indexing:** Firebase (temporary), The Graph (upcoming)
* **UI:** TailwindCSS, Lucide Icons
* **Payments:** Paystack integration

## Links

* [Project Website](https://mavuno-hedera.netlify.app/)
* [Demo Video](https://youtu.be/iFlyOgZJlYg?si=TNjaoomDKI8zX77h)
* [Pitch Deck](https://www.canva.com/design/DAG2-f83UzM/JMrjo-iDnDi6nKNgd76L7w/edit?utm_content=DAG2-f83UzM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
* [Certification - Taiwo](https://drive.google.com/file/d/1mWjpUafZlelqcIPvuEbfECXrNoD8OUwh/view?usp=sharing)
* [Certification - Ibrahim](https://drive.google.com/file/d/1hxNaWWOZ2JBN-DIIbbXVss5sBwVKfSOS/view?usp=sharing)
