import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "testnet",
  });

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // --- Deploy Fiat tokens ---
  const Fiat = await ethers.getContractFactory("Fiat");

  const ngn = await Fiat.deploy();
  await ngn.waitForDeployment();
  await ngn.createUnderlying("Nigeria Naira", "NGN", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("NGN:", await ngn.getAddress());
  console.log("NGN underlying:", await ngn.underlying());

  const cedi = await Fiat.deploy();
  await cedi.waitForDeployment();
  await cedi.createUnderlying("Ghanaian Cedi", "CEDI", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("CEDI:", await cedi.getAddress());
  console.log("CEDI underlying:", await cedi.underlying());

  const rand = await Fiat.deploy();
  await rand.waitForDeployment();
  await rand.createUnderlying("South African Rand", "RAND", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("RAND:", await rand.getAddress());
  console.log("RAND underlying:", await rand.underlying());

  // --- Deploy Oracle ---
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();

  console.log("Oracle deployed at:", await oracle.getAddress());

  // Initialize oracle
  await oracle.setfiatPerHbar(await ngn.getAddress(), 19_000);
  await oracle.setfiatPerHbar(await cedi.getAddress(), 15_000);
  await oracle.setfiatPerHbar(await rand.getAddress(), 17_000);

  // --- Deploy Farmer's Registry ---
  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.waitForDeployment();

  console.log("FarmerRegistry deployed at:", await farmerRegistry.getAddress());

  // --- Deploy MavunoFactory ---
  const MavunoFactory = await ethers.getContractFactory("MavunoFactory");
  const mavunoFactory = await MavunoFactory.deploy(
    deployer.address,
    await oracle.getAddress(),
    await farmerRegistry.getAddress()
  );
  await mavunoFactory.waitForDeployment();

  console.log("MavunoFactory deployed at:", await mavunoFactory.getAddress());

  // --- Create pools ---
  await mavunoFactory.createPool(await ngn.getAddress());
  await mavunoFactory.createPool(await cedi.getAddress());
  await mavunoFactory.createPool(await rand.getAddress());

  console.log(
    "NGN pool:",
    await mavunoFactory.fiatToPool(await ngn.getAddress())
  );
  console.log(
    "CEDI pool:",
    await mavunoFactory.fiatToPool(await cedi.getAddress())
  );
  console.log(
    "RAND pool:",
    await mavunoFactory.fiatToPool(await rand.getAddress())
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Deploying contracts with: 0x2531dCd3dC58559c19EEE09736443D026D40d5f5
// NGN: 0x1bF92557bCD03fF7CF57403D977cc183D479A7A2
// NGN underlying: 0x0000000000000000000000000000000000693196
// CEDI: 0x3d24dEc730f091c1d2369350DFE59a0F11d0B6f1
// CEDI underlying: 0x0000000000000000000000000000000000693199
// RAND: 0xee16dC17900De4483fe89eBf33AaE692EdD9d2c4
// RAND underlying: 0x000000000000000000000000000000000069319b
// Oracle deployed at: 0x35a60EE51D49c3e5d2B9A47D6bEdD2C6970E5260
// FarmerRegistry deployed at: 0x3c69cEb2370f26CD8377c8215c70429242d14aF5
// MavunoFactory deployed at: 0x22154535138449c04E08B2c37171713Eb22a3AA9
// NGN pool: 0x6651FA2d7128351e07Cb012B32174CAD630aB19F
// CEDI pool: 0x9b3203d2e0D9D4608B22d505d41c667E50683801
// RAND pool: 0x0b61B3a9a233AcF5ddd9e81c0C555978Bba531aB
