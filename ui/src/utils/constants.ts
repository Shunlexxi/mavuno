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
  NairaFiat: "0x8101f81080d4e4E155a0A5693Fe290A4dFEc3C9e" as Hex,
  NairaFiatUnderlying: "0x00000000000000000000000000000000006d24EC" as Hex,
  CediFiat: "0x4Df6d091d659106dBCE06aF95Fe1bd2f36056bA1" as Hex,
  CediFiatUnderlying: "0x00000000000000000000000000000000006D24f1" as Hex,
  RandFiat: "0xBB3b10e2758a1a364451E5b69Abdf530Bd087185" as Hex,
  RandFiatUnderlying: "0x00000000000000000000000000000000006D24f3" as Hex,
  Orcale: "0x0B660825c8E6dDA8afcFBb3E9507379a29DE51bA" as Hex,
  FarmerRegistry: "0x956AAEAdaA63A97C94E0f57159a406f7dcF2Cd52" as Hex,
  NairaPool: "0x3C259f20Ded65DCb7000B320CB491FDD9395bD77" as Hex,
  CediPool: "0x4dF14321909f8d482CCafF9ad82D4B686fBB4447" as Hex,
  RandPool: "0xA279A377D2d097E31a7A99945E87463fCD8A8420" as Hex,
  MavToken: "0x99718EF4Eb7027E40994949c6e2fc1827B43A7A9" as Hex,
  NairaFiatUnderlyingId: "0.0.7152876",
  CediFiatUnderlyingId: "0.0.7152881",
  RandFiatUnderlyingId: "0.0.7152883",
};

export const Symbols: Record<Hex, string> = {};

Symbols[Contracts.NairaPool] = "₦";
Symbols[Contracts.CediPool] = "₵";
Symbols[Contracts.RandPool] = "R";

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
