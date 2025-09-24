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
// NGN: 0xf7Db3DE3326355141961AACBd18d8c084ed066c1
// NGN underlying: 0x000000000000000000000000000000000069316A
// CEDI: 0x9f00c23AcF79a173696Ee945e87D4A7Caf79A059
// CEDI underlying: 0x000000000000000000000000000000000069316C
// RAND: 0x060C9Fd383CF44aC9300F4CFE2fE344FABD7Bba8
// RAND underlying: 0x000000000000000000000000000000000069316e
// Oracle deployed at: 0x0023f68D4190e0B57892746056b8C9e6E46f26B5
// FarmerRegistry deployed at: 0x3e064b29aA1Ac26cE62FBaC3Be989CFD280AcfC1
// MavunoFactory deployed at: 0x50066067338a90edEC11713ccA6e8993b6cd2371
// NGN pool: 0xFBE418B237598b053C79A905E5cA2bdf7FE43E73
// CEDI pool: 0x7D728230506679AE94B1B5B78320A6fEA236F19c
// RAND pool: 0x4b7bDA3be01660c52B52a45aBB8a80becE6630fb
