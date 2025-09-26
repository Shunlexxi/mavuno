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

  const ngnUnderlying = await ethers.getContractAt(
    "IHederaTokenService",
    await ngn.underlying()
  );

  await ngnUnderlying.associateToken(deployer.address, ngn.underlying());

  const cedi = await Fiat.deploy();
  await cedi.waitForDeployment();
  await cedi.createUnderlying("Ghanaian Cedi", "CEDI", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("CEDI:", await cedi.getAddress());
  console.log("CEDI underlying:", await cedi.underlying());

  const cediUnderlying = await ethers.getContractAt(
    "IHederaTokenService",
    await cedi.underlying()
  );

  await cediUnderlying.associateToken(deployer.address, cedi.underlying());

  const rand = await Fiat.deploy();
  await rand.waitForDeployment();
  await rand.createUnderlying("South African Rand", "RAND", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("RAND:", await rand.getAddress());
  console.log("RAND underlying:", await rand.underlying());

  const randUnderlying = await ethers.getContractAt(
    "IHederaTokenService",
    await rand.underlying()
  );

  await randUnderlying.associateToken(deployer.address, rand.underlying());

  // --- Deploy Oracle ---
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();

  console.log("Oracle deployed at:", await oracle.getAddress());

  // Initialize oracle
  await oracle.setfiatPerHbar(await ngn.getAddress(), 1_900_000);
  await oracle.setfiatPerHbar(await cedi.getAddress(), 1_500_000);
  await oracle.setfiatPerHbar(await rand.getAddress(), 1_700_000);

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
// NGN: 0xCB7fB204F7aF2Fb0BfF2f92D8250Fd6De62c4114
// NGN underlying: 0x00000000000000000000000000000000006967a4
// CEDI: 0xBE04AAcF1cD36A8bF64C3dF5d2fe1f56045bd16c
// CEDI underlying: 0x00000000000000000000000000000000006967a6
// RAND: 0xEc786B065Be8360f9f32Fc82b00A082d0DcE7aCc
// RAND underlying: 0x00000000000000000000000000000000006967aB
// Oracle deployed at: 0x8f691a8Fda6008A6D28060C0df04d7448384b4eE
// FarmerRegistry deployed at: 0x991Ea75C34B6f7835Cd8a2c5bbB89F86c455752D
// MavunoFactory deployed at: 0x223593679a880e881a050a49697911db5B3a96A2
// NGN pool: 0xf54ea62f9613A9627bf7C533Fa7d8c92f121aB0F
// CEDI pool: 0x9862220658e9D83dB543dbC926a6eF1fFd530937
// RAND pool: 0xf5c0BA890C08628A4a1FBB4dFD9000FAA32369b1
