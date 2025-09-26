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
  NairaFiat: "0x908E7B74887f47799c7d75c5a7FC5b25344Ef287" as Hex,
  NairaFiatUnderlying: "0x0000000000000000000000000000000000696A59" as Hex,
  CediFiat: "0x8e618CEeb54fB10b52Ab2CCD8839FC4A9b28CA75" as Hex,
  CediFiatUnderlying: "0x0000000000000000000000000000000000696A5B" as Hex,
  RandFiat: "0xfd3DC4dC7dc401874215896180c1838C9476d2f1" as Hex,
  RandFiatUnderlying: "0x0000000000000000000000000000000000696a63" as Hex,
  Orcale: "0xd964B9ecf0779595Db15912A05c546C418DD0f72" as Hex,
  FarmerRegistry: "0x666942D4582D40375965150a774068a529312926" as Hex,
  MavunoFactory: "0xA84a52665aAd57db7544c61df496fa31F8de1d37" as Hex,
  NairaPool: "0xd09FEd685D3C1d390a3Ba6348d664619D65330c7" as Hex,
  CediPool: "0xC40DbD39555823F30c28C72fF44b42dAEA35f048" as Hex,
  RandPool: "0xA2e03e5299c12f7231E820d291b530B7003Db803" as Hex,
  NairaFiatUnderlyingId: "0.0.6908505",
  CediFiatUnderlyingId: "0.0.6908507",
  RandFiatUnderlyingId: "0.0.6908515",
};

export const Symbols: Record<Hex, string> = {};

Symbols[Contracts.NairaPool] = "₦";
Symbols[Contracts.CediPool] = "₵";
Symbols[Contracts.RandPool] = "R";

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
