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
  NairaFiat: "0x1bF92557bCD03fF7CF57403D977cc183D479A7A2" as Hex,
  NairaFiatUnderlying: "0x0000000000000000000000000000000000693196" as Hex,
  CediFiat: "0x3d24dEc730f091c1d2369350DFE59a0F11d0B6f1" as Hex,
  CediFiatUnderlying: "0x0000000000000000000000000000000000693199" as Hex,
  RandFiat: "0xee16dC17900De4483fe89eBf33AaE692EdD9d2c4" as Hex,
  RandFiatUnderlying: "0x000000000000000000000000000000000069319b" as Hex,
  Orcale: "0x35a60EE51D49c3e5d2B9A47D6bEdD2C6970E5260" as Hex,
  FarmerRegistry: "0x3c69cEb2370f26CD8377c8215c70429242d14aF5" as Hex,
  MavunoFactory: "0x22154535138449c04E08B2c37171713Eb22a3AA9" as Hex,
  NairaPool: "0x6651FA2d7128351e07Cb012B32174CAD630aB19F" as Hex,
  CediPool: "0x9b3203d2e0D9D4608B22d505d41c667E50683801" as Hex,
  RandPool: "0x0b61B3a9a233AcF5ddd9e81c0C555978Bba531aB" as Hex,
  CediFiatUnderlyingId: "",
  RandFiatUnderlyingId: "",
  NairaFiatUnderlyingId: "",
};

export const Symbols: Record<Hex, string> = {};

Symbols[Contracts.NairaPool] = "₦";
Symbols[Contracts.CediPool] = "₵";
Symbols[Contracts.RandPool] = "R";

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
