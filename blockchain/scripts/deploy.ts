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
// NGN: 0x908E7B74887f47799c7d75c5a7FC5b25344Ef287
// NGN underlying: 0x0000000000000000000000000000000000696A59
// CEDI: 0x8e618CEeb54fB10b52Ab2CCD8839FC4A9b28CA75
// CEDI underlying: 0x0000000000000000000000000000000000696A5B
// RAND: 0xfd3DC4dC7dc401874215896180c1838C9476d2f1
// RAND underlying: 0x0000000000000000000000000000000000696a63
// Oracle deployed at: 0xd964B9ecf0779595Db15912A05c546C418DD0f72
// FarmerRegistry deployed at: 0x666942D4582D40375965150a774068a529312926
// MavunoFactory deployed at: 0xA84a52665aAd57db7544c61df496fa31F8de1d37
// NGN pool: 0xd09FEd685D3C1d390a3Ba6348d664619D65330c7
// CEDI pool: 0xC40DbD39555823F30c28C72fF44b42dAEA35f048
// RAND pool: 0xA2e03e5299c12f7231E820d291b530B7003Db803
