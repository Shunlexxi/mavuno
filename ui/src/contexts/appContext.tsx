/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  createAppKit,
  OpenOptions,
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { useHederaMethods } from "../hooks/useHederaMethods";
import { useEthereumMethods } from "../hooks/useEthereumMethods";
import { JsonRpcProvider } from "ethers";
import {
  HederaProvider,
  HederaAdapter,
  HederaChainDefinition,
  hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";
import { metadata } from "../config/walletConnect";

const jsonRpcProvider = new JsonRpcProvider("https://testnet.hashio.io/api");

const nativeHederaAdapter = new HederaAdapter({
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  networks: [HederaChainDefinition.Native.Testnet],
  namespace: hederaNamespace,
});

const eip155HederaAdapter = new HederaAdapter({
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  networks: [HederaChainDefinition.EVM.Testnet],
  namespace: "eip155",
});

const providerOpts = {
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  metadata,
  logger: "error" as const,
  optionalNamespaces: {
    eip155: {
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
        "eth_signTypedData_v4",
        "eth_accounts",
        "eth_chainId",
      ],
      chains: ["eip155:296", "eip155:295"],
      events: ["chainChanged", "accountsChanged"],
      rpcMap: { "eip155:296": "https://testnet.hashio.io/api" },
    },
    hedera: {
      methods: [
        "hedera_getNodeAddresses",
        "hedera_executeTransaction",
        "hedera_signMessage",
        "hedera_signAndExecuteQuery",
        "hedera_signAndExecuteTransaction",
        "hedera_signTransaction",
      ],
      chains: ["hedera:testnet"],
      events: ["chainChanged", "accountsChanged"],
    },
  },
};

const universalProvider = await HederaProvider.init(providerOpts);

createAppKit({
  adapters: [nativeHederaAdapter, eip155HederaAdapter],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  metadata,
  //@ts-expect-error expected type error
  universalProvider,
  networks: [
    HederaChainDefinition.EVM.Testnet,
    HederaChainDefinition.Native.Testnet,
  ],
  enableReconnect: true,
  features: {
    analytics: true,
    socials: false,
    swaps: false,
    onramp: false,
    email: false,
  },
  chainImages: {
    "hedera:testnet": "/hedera.svg",
    "eip155:296": "/hedera.svg",
  },
});

interface MavunoAppKitConfig {
  projectId: string;
  rpcUrl: string;
  jsonRpcProvider: JsonRpcProvider;
  nativeHederaAdapter: HederaAdapter;
  eip155HederaAdapter: HederaAdapter;
}

interface MavunoAppKitContextType {
  appKitConfig: MavunoAppKitConfig | null;
  isConnected: boolean;
  address?: string;
  caipAddress?: string;
  status?: string;
  transactionHash: string;
  transactionId: string;
  signedMsg: string;
  nodes: string[];
  showConfigModal: boolean;
  hederaAccount?: string;
  eip155Account?: string;
  eip155ChainId?: number;
  open: (options?: OpenOptions<any>) => Promise<void | { hash: string }>;
  disconnect: () => Promise<void>;
  executeHederaMethod: (method: string, params?: any) => Promise<void>;
  executeEthMethod: (method: string, params?: any) => Promise<void>;
  setShowConfigModal: (show: boolean) => void;
  clearResults: () => void;
}

const MavunoAppKitContext = createContext<MavunoAppKitContextType | undefined>(
  undefined
);

export const MavunoAppKitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [signedMsg, setSignedMsg] = useState("");
  const [nodes, setNodes] = useState<string[]>([]);

  const [appKitConfig, setAppKitConfig] = useState<MavunoAppKitConfig | null>(
    null
  );
  const [hederaAccount, setHederaAccount] = useState<string>();
  const [eip155Account, setEip155Account] = useState<string>();
  const [eip155ChainId, setEip155ChainId] = useState<number>();

  const { executeHederaMethod } = useHederaMethods(
    universalProvider,
    hederaAccount || "",
    setTransactionId,
    setSignedMsg,
    setNodes
  );

  const { executeEthMethod } = useEthereumMethods({
    walletProvider: universalProvider,
    chainId: eip155ChainId,
    address: eip155Account,
    ethTxHash: transactionHash,
    sendHash: setTransactionHash,
    sendSignMsg: setSignedMsg,
    jsonRpcProvider: appKitConfig?.jsonRpcProvider,
  });

  React.useEffect(() => {
    setAppKitConfig({
      projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
      rpcUrl: "https://testnet.hashio.io/api",
      jsonRpcProvider,
      nativeHederaAdapter,
      eip155HederaAdapter,
    });

    const hederaAcc =
      universalProvider?.session?.namespaces?.hedera?.accounts?.[0]
        ?.split(":")
        .pop();
    const eip155Acc =
      universalProvider?.session?.namespaces?.eip155?.accounts?.[0]
        ?.split(":")
        .pop();
    const eip155Chain =
      universalProvider?.session?.namespaces?.eip155?.chains?.[0]?.split(
        ":"
      )[1];

    setHederaAccount(hederaAcc);
    setEip155Account(eip155Acc);
    setEip155ChainId(eip155Chain ? parseInt(eip155Chain) : undefined);
  }, []);

  const clearResults = () => {
    setTransactionHash("");
    setTransactionId("");
    setSignedMsg("");
    setNodes([]);
  };

  return (
    <MavunoAppKitContext.Provider
      value={{
        appKitConfig,
        isConnected,
        address,
        caipAddress,
        status,
        transactionHash,
        transactionId,
        signedMsg,
        nodes,
        showConfigModal,
        hederaAccount,
        eip155Account,
        eip155ChainId,
        open,
        disconnect,
        executeHederaMethod,
        executeEthMethod,
        setShowConfigModal,
        clearResults,
      }}
    >
      {children}
    </MavunoAppKitContext.Provider>
  );
};

export const useMavunoAppKit = (): MavunoAppKitContextType => {
  const context = useContext(MavunoAppKitContext);
  if (!context) {
    throw new Error(
      "useMavunoAppKit must be used within a MavunoAppKitProvider"
    );
  }
  return context;
};
