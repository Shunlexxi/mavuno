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
  await ngn.createUnderlying("Nigerian Naira", "NGN", 7_776_000, {
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

  const ghs = await Fiat.deploy();
  await ghs.waitForDeployment();
  await ghs.createUnderlying("Ghanaian Cedi", "GHS", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("GHS:", await ghs.getAddress());
  console.log("GHS underlying:", await ghs.underlying());

  const ghsUnderlying = await ethers.getContractAt(
    "IHederaTokenService",
    await ghs.underlying()
  );

  await ghsUnderlying.associateToken(deployer.address, ghs.underlying());

  const zar = await Fiat.deploy();
  await zar.waitForDeployment();
  await zar.createUnderlying("South African Rand", "ZAR", 7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  });

  console.log("ZAR:", await zar.getAddress());
  console.log("ZAR underlying:", await zar.underlying());

  const zarUnderlying = await ethers.getContractAt(
    "IHederaTokenService",
    await zar.underlying()
  );

  await zarUnderlying.associateToken(deployer.address, zar.underlying());

  // --- Deploy Oracle ---
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();

  console.log("Oracle deployed at:", await oracle.getAddress());

  // Initialize oracle
  await oracle.setfiatPerHbar(await ngn.getAddress(), 1_900_000);
  await oracle.setfiatPerHbar(await ghs.getAddress(), 1_500_000);
  await oracle.setfiatPerHbar(await zar.getAddress(), 1_700_000);

  // --- Deploy Farmer's Registry ---
  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.waitForDeployment();

  console.log("FarmerRegistry deployed at:", await farmerRegistry.getAddress());

  // // --- Deploy MavunoFactory ---
  // const MavunoFactory = await ethers.getContractFactory("MavunoFactory");
  // const mavunoFactory = await MavunoFactory.deploy(
  //   deployer.address,
  //   await oracle.getAddress(),
  //   await farmerRegistry.getAddress()
  // );
  // await mavunoFactory.waitForDeployment();

  // console.log("MavunoFactory deployed at:", await mavunoFactory.getAddress());

  // // --- Create pools ---
  // await mavunoFactory.createPool(await ngn.getAddress());
  // await mavunoFactory.createPool(await ghs.getAddress());
  // await mavunoFactory.createPool(await zar.getAddress());

  // console.log(
  //   "NGN pool:",
  //   await mavunoFactory.fiatToPool(await ngn.getAddress())
  // );
  // console.log(
  //   "GHS pool:",
  //   await mavunoFactory.fiatToPool(await ghs.getAddress())
  // );
  // console.log(
  //   "ZAR pool:",
  //   await mavunoFactory.fiatToPool(await zar.getAddress())
  // );

  // --- Deploy LendingPools ---
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const ngnLendingPool = await LendingPool.deploy(
    deployer.address,
    await oracle.getAddress(),
    await ngn.getAddress(),
    await farmerRegistry.getAddress()
  );
  await ngnLendingPool.waitForDeployment();

  console.log(
    "NGN LendingPool deployed at:",
    await ngnLendingPool.getAddress()
  );

  const ghsLendingPool = await LendingPool.deploy(
    deployer.address,
    await oracle.getAddress(),
    await ghs.getAddress(),
    await farmerRegistry.getAddress()
  );
  await ghsLendingPool.waitForDeployment();

  console.log(
    "GHS LendingPool deployed at:",
    await ghsLendingPool.getAddress()
  );

  const zarLendingPool = await LendingPool.deploy(
    deployer.address,
    await oracle.getAddress(),
    await zar.getAddress(),
    await farmerRegistry.getAddress()
  );
  await zarLendingPool.waitForDeployment();

  console.log(
    "ZAR LendingPool deployed at:",
    await zarLendingPool.getAddress()
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// NGN: 0xfb17e5e510a72885b8b7Ba30ce33B8CcDABa5dbE
// NGN underlying: 0x0000000000000000000000000000000000699F08
// GHS: 0x2De3704dd711dD0dd2FE884c839CC4D4E7Dedc58
// GHS underlying: 0x0000000000000000000000000000000000699f0C
// ZAR: 0xF36184FeC60231A1224dE879374bF5069a1fcB0B
// ZAR underlying: 0x0000000000000000000000000000000000699f12
// Oracle deployed at: 0x2833729128769a516377989F60a2585F829Df840
// FarmerRegistry deployed at: 0xC84BA071EE3372DfBc9023d2d292dc363937293C
// NGN LendingPool deployed at: 0x12B1639724058F953fA1f5b108402C83aA58d0fD
// GHS LendingPool deployed at: 0x8D6883aAB2DC30dC515017401C66db0Db3fD93EF
// ZAR LendingPool deployed at: 0xCF934d7D3cEda918ee5a581B96AeF09028065469
