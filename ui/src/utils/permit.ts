import { TypedDataDomain, type Hex } from "viem";

export const buildBorrowPermitParams = (
  chainId: number,
  verifyingContract: Hex,
  name: string,
  version: string,
  farmer: Hex,
  amount: bigint,
  nonce: number,
  deadline: number
) => ({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Borrow: [
      { name: "farmer", type: "address" },
      { name: "amount", type: "int64" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  primaryType: "Borrow" as const,
  domain: { name, version, chainId, verifyingContract } as TypedDataDomain,
  message: { farmer, amount, nonce, deadline },
  account: farmer,
});
