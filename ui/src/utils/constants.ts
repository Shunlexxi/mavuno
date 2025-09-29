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
  NairaFiat: "0xfb17e5e510a72885b8b7Ba30ce33B8CcDABa5dbE" as Hex,
  NairaFiatUnderlying: "0x0000000000000000000000000000000000699F08" as Hex,
  CediFiat: "0x2De3704dd711dD0dd2FE884c839CC4D4E7Dedc58" as Hex,
  CediFiatUnderlying: "0x0000000000000000000000000000000000699f0C" as Hex,
  RandFiat: "0xF36184FeC60231A1224dE879374bF5069a1fcB0B" as Hex,
  RandFiatUnderlying: "0x0000000000000000000000000000000000699f12" as Hex,
  Orcale: "0x2833729128769a516377989F60a2585F829Df840" as Hex,
  FarmerRegistry: "0xC84BA071EE3372DfBc9023d2d292dc363937293C" as Hex,
  NairaPool: "0x12B1639724058F953fA1f5b108402C83aA58d0fD" as Hex,
  CediPool: "0x8D6883aAB2DC30dC515017401C66db0Db3fD93EF" as Hex,
  RandPool: "0xCF934d7D3cEda918ee5a581B96AeF09028065469" as Hex,
  NairaFiatUnderlyingId: "0.0.6921992",
  CediFiatUnderlyingId: "0.0.6921996",
  RandFiatUnderlyingId: "0.0.6922002",
};

export const Symbols: Record<Hex, string> = {};

Symbols[Contracts.NairaPool] = "₦";
Symbols[Contracts.CediPool] = "₵";
Symbols[Contracts.RandPool] = "R";

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
