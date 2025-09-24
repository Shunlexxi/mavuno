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
  Orcale: "0x0023f68D4190e0B57892746056b8C9e6E46f26B5" as Hex,
  FarmerRegistry: "0x3e064b29aA1Ac26cE62FBaC3Be989CFD280AcfC1" as Hex,
  MavunoFactory: "0x50066067338a90edEC11713ccA6e8993b6cd2371" as Hex,
  NairaPool: "0xFBE418B237598b053C79A905E5cA2bdf7FE43E73" as Hex,
  CediPool: "0x0F067719DfB8d1ee379225c22ea90E55CE406Cb8" as Hex,
  RandPool: "0x4b7bDA3be01660c52B52a45aBB8a80becE6630fb" as Hex,
  NairaFiat: "0xf7Db3DE3326355141961AACBd18d8c084ed066c1" as Hex,
  CediFiat: "0x9f00c23AcF79a173696Ee945e87D4A7Caf79A059" as Hex,
  RandFiat: "0x060C9Fd383CF44aC9300F4CFE2fE344FABD7Bba8" as Hex,
  NairaFiatUnderlying: "0x000000000000000000000000000000000069316A" as Hex,
  CediFiatUnderlying: "0x000000000000000000000000000000000069316C" as Hex,
  RandFiatUnderlying: "0x000000000000000000000000000000000069316e" as Hex,
};

export const MAX_BPS = 10_000;
export const MAX_BPS_POW = 2;
