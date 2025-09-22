import { parseEther } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main(hre: HardhatRuntimeEnvironment) {
  const { viem } = hre;
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contracts with:", deployer.account.address);

  // Deploy Fiat tokens
  const ngn = await viem.deployContract("Fiat");

  //   await ngn.write.createUnderlying(["Nigeria Naira", "NGN", 7_776_000n], {
  //     value: parseEther("5"),
  //   });

  const cedi = await viem.deployContract("Fiat");

  //   await cedi.write.createUnderlying(["Ghanaian Cedi", "CEDI", 7_776_000n], {
  //     value: parseEther("5"),
  //   });

  const rand = await viem.deployContract("Fiat");

  //   await rand.write.createUnderlying(["South African Rand", "RAND", 7_776_000n], {
  //     value: parseEther("5"),
  //   });

  console.log("Fiat contracts deployed:");
  console.log("NGN:", ngn.address);
  console.log("CEDI:", cedi.address);
  console.log("RAND:", rand.address);

  // Deploy Oracle
  const oracle = await viem.deployContract("Oracle", []);

  console.log("Oracle deployed at:", oracle.address);

  // Initialize oracle
  await oracle.write.setfiatPerHbar([ngn.address, 1_937n]);
  await oracle.write.setfiatPerHbar([cedi.address, 1_512n]);
  await oracle.write.setfiatPerHbar([rand.address, 1_602n]);

  // Deploy MavunoFactory
  const mavunoFactory = await viem.deployContract("MavunoFactory", [
    deployer.account.address,
    oracle.address,
  ]);

  console.log("MavunoFactory deployed at:", mavunoFactory.address);

  // Create pools
  await mavunoFactory.write.createPool([ngn.address]);
  await mavunoFactory.write.createPool([cedi.address]);
  await mavunoFactory.write.createPool([rand.address]);

  console.log("Pools created for NGN, CEDI, RAND.");
}

export default main;

if (require.main === module) {
  import("hardhat").then((hre) => {
    main(hre)
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });
}
