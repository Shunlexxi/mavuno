/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  writeContract as wagmi_writeContract,
  WriteContractReturnType,
} from "wagmi/actions";
import { Abi, ContractFunctionArgs, ContractFunctionName, Hex } from "viem";
import { AccountId, Hbar, TransactionId } from "@hashgraph/sdk";
import { Config } from "wagmi";

import { useConfig } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

export function useWriteContract() {
  const config = useConfig();
  const queryClient = useQueryClient();

  const handleWriteContract = async <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
    args extends ContractFunctionArgs<
      abi,
      "nonpayable" | "payable",
      functionName
    >,
  >(parameters: {
    address: Hex;
    abi: abi;
    functionName: functionName;
    metaArgs?: Partial<{
      gas: Hbar | number;
      amount: number;
      maxTransactionFee: Hbar | number;
      nodeAccountIds: AccountId[];
      transactionId: TransactionId;
      transactionMemo: string;
      transactionValidDuration: number;
    }>;
    args: args;
  }) => {
    return queryClient.fetchQuery({
      queryKey: ["WRITE_CONTRACT", parameters.functionName, parameters.address],
      queryFn: () =>
        writeContract({
          config,
          parameters,
        }),
    });
  };

  return {
    writeContract: handleWriteContract,
  };
}

export const writeContract = async <
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<
    abi,
    "nonpayable" | "payable",
    functionName
  >,
>({
  config,
  parameters,
}: {
  config: Config;
  parameters: {
    address: Hex;
    abi: abi;
    functionName: functionName;
    metaArgs?: Partial<{
      gas: Hbar | number;
      amount: number;
      maxTransactionFee: Hbar | number;
      nodeAccountIds: AccountId[];
      transactionId: TransactionId;
      transactionMemo: string;
      transactionValidDuration: number;
    }>;
    args: args;
  };
}): Promise<WriteContractReturnType> => {
  const { address, abi, functionName, metaArgs, args } = parameters;

  return await wagmi_writeContract(config, {
    __mode: "prepared",
    abi,
    address,
    functionName,
    args,
    ...(metaArgs as any),
  });
};
