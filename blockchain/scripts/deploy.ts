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
  await oracle.setfiatPerHbar(await ngn.getAddress(), 1937n);
  await oracle.setfiatPerHbar(await cedi.getAddress(), 1512n);
  await oracle.setfiatPerHbar(await rand.getAddress(), 1602n);

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
