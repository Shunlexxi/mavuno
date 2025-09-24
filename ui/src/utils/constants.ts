import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "viem/chains";

export const adminClient = createWalletClient({
  account: privateKeyToAccount(import.meta.env.VITE_ADMIN_PK),
  chain: hederaTestnet,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
});

export const Contracts = {
  Orcale: "0x8D56562380d5AF3049D41B0E8Bce300008466966" as Hex,
  MavunoFactory: "0x40202F97aC71f5638ee5e99BBBccB627A31BeD93" as Hex,
  FarmerRegistry: "0xc0af5a1F1Fb6E7652aA5A33710201D0C697E0104" as Hex,
  NairaPool: "0xcDE8227f90367E4B7e2cBECB8b55eC1737181EA6" as Hex,
  CediPool: "0x0F067719DfB8d1ee379225c22ea90E55CE406Cb8" as Hex,
  RandPool: "0x9729f48585823188ebDDe366DF1cA24A316B4188" as Hex,
  NairaFiat: "0x015D9E98582E8BD14be7Ee7b6758C4E7f3359A3a" as Hex,
  CediFiat: "0x3d4DDB67F2f5B32A192EEc27B1B067aB41BD7019" as Hex,
  RandFiat: "0x2B309A76999A5665778E537771645855F1742f8B" as Hex,
  NairaPoolFiatUnderlying: "0x000000000000000000000000000000000069265e" as Hex,
  CediPoolFiatUnderlying: "0x0000000000000000000000000000000000692666" as Hex,
  RandPoolFiatUnderlying: "0x0000000000000000000000000000000000692669" as Hex,
};

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
