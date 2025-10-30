export const mavAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "CallResponseEvent",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "int64",
        name: "autoRenewPeriod",
        type: "int64",
      },
    ],
    name: "create",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "int64",
        name: "amount",
        type: "int64",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "encodedFunctionSelector",
        type: "bytes",
      },
    ],
    name: "redirectForToken",
    outputs: [
      {
        internalType: "int256",
        name: "responseCode",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "response",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "serialNumber",
        type: "uint256",
      },
    ],
    name: "transferFromNFT",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
