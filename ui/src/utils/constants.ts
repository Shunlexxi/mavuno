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
  NairaFiat: "0xCB7fB204F7aF2Fb0BfF2f92D8250Fd6De62c4114" as Hex,
  NairaFiatUnderlying: "0x00000000000000000000000000000000006967a4" as Hex,
  CediFiat: "0xBE04AAcF1cD36A8bF64C3dF5d2fe1f56045bd16c" as Hex,
  CediFiatUnderlying: "0x00000000000000000000000000000000006967a6" as Hex,
  RandFiat: "0xEc786B065Be8360f9f32Fc82b00A082d0DcE7aCc" as Hex,
  RandFiatUnderlying: "0x00000000000000000000000000000000006967aB" as Hex,
  Orcale: "0x8f691a8Fda6008A6D28060C0df04d7448384b4eE" as Hex,
  FarmerRegistry: "0x991Ea75C34B6f7835Cd8a2c5bbB89F86c455752D" as Hex,
  MavunoFactory: "0x223593679a880e881a050a49697911db5B3a96A2" as Hex,
  NairaPool: "0xf54ea62f9613A9627bf7C533Fa7d8c92f121aB0F" as Hex,
  CediPool: "0x9862220658e9D83dB543dbC926a6eF1fFd530937" as Hex,
  RandPool: "0xf5c0BA890C08628A4a1FBB4dFD9000FAA32369b1" as Hex,
  CediFiatUnderlyingId: "0.0.6907812",
  RandFiatUnderlyingId: "0.0.6907814",
  NairaFiatUnderlyingId: "0.0.6907819",
};

export const Symbols: Record<Hex, string> = {};

Symbols[Contracts.NairaPool] = "₦";
Symbols[Contracts.CediPool] = "₵";
Symbols[Contracts.RandPool] = "R";

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
