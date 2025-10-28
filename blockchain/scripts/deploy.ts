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

  const Mav = await ethers.getContractFactory("Mav");
  const mav = await Mav.deploy();
  await mav.waitForDeployment();

  await mav.create(7_776_000, {
    value: ethers.parseEther("10"),
    gasLimit: 1_000_000,
  })

  console.log("Mav deployed at:", await mav.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Deploying contracts with: 0xb5d7E1b762cD7993334C2E08449DCE6460B51154
// NGN: 0x8101f81080d4e4E155a0A5693Fe290A4dFEc3C9e
// NGN underlying: 0x00000000000000000000000000000000006d24EC
// GHS: 0x4Df6d091d659106dBCE06aF95Fe1bd2f36056bA1
// GHS underlying: 0x00000000000000000000000000000000006D24f1
// ZAR: 0xBB3b10e2758a1a364451E5b69Abdf530Bd087185
// ZAR underlying: 0x00000000000000000000000000000000006D24f3
// Oracle deployed at: 0x0B660825c8E6dDA8afcFBb3E9507379a29DE51bA
// FarmerRegistry deployed at: 0x956AAEAdaA63A97C94E0f57159a406f7dcF2Cd52
// NGN LendingPool deployed at: 0x3C259f20Ded65DCb7000B320CB491FDD9395bD77
// GHS LendingPool deployed at: 0x4dF14321909f8d482CCafF9ad82D4B686fBB4447
// ZAR LendingPool deployed at: 0xA279A377D2d097E31a7A99945E87463fCD8A8420
// Mav deployed at: 0x99718EF4Eb7027E40994949c6e2fc1827B43A7A9
