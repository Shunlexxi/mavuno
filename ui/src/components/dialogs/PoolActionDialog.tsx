import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Pool } from "@/types";
import { toast } from "sonner";
import Paystack from "@paystack/inline-js";
import { formatUnits, parseUnits } from "viem";
import { lendingPoolAbi } from "@/abis/lendingPool";
import {
  adminClient,
  Contracts,
  MAX_BPS_POW,
  publicClient,
  Symbols,
} from "@/utils/constants";
import { hederaTestnet } from "viem/chains";
import { useAccount } from "wagmi";
import { fiatAbi } from "@/abis/fiat";
import { useWriteContract } from "@/utils/hedera";
import { doc, updateDoc, getFirestore, increment } from "firebase/firestore";
import timelineService from "@/services/timelineService";
import { AccountId, Client, TokenId } from "@hashgraph/sdk";

interface PoolActionDialogProps {
  pool: Pool;
  action: "supply" | "borrow" | "withdraw" | "repay";
  children: React.ReactNode;
}

export default function PoolActionDialog({
  pool,
  action,
  children,
}: PoolActionDialogProps) {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [borrowable, setBorrowable] = useState(0);
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingWithBank, setIsProcessingWithBank] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const actionConfig = {
    supply: {
      title: `Supply ${pool.currency}`,
      description: `Add liquidity to the ${pool.currency} pool and earn interest`,
      buttonText: "Supply",
      buttonText2:
        pool.address == Contracts.NairaPool ? "Supply with Bank" : undefined,
      icon: DollarSign,
      color: "text-green-600",
    },
    borrow: {
      title: `Borrow ${pool.currency}`,
      description: `Borrow ${pool.currency} against your HBAR collateral`,
      buttonText: "Borrow",
      buttonText2: undefined,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    withdraw: {
      title: `Withdraw ${pool.currency}`,
      description: `Remove your supplied ${pool.currency} from the pool`,
      buttonText: "Withdraw",
      icon: Wallet,
      buttonText2: undefined,
      color: "text-orange-600",
    },
    repay: {
      title: `Repay ${pool.currency}`,
      description: `Repay your borrowed ${pool.currency}`,
      buttonText: "Repay",
      buttonText2:
        pool.address == Contracts.NairaPool ? "Repay with Bank" : undefined,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  };

  const config = actionConfig[action];
  const IconComponent = config.icon;

  const approve = async () => {
    toast.loading("Approving...");

    await writeContract({
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "response",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      address: pool.fiatUnderlying,
      functionName: "approve",
      args: [pool.address, parseUnits(amount, 2)],
    });
  };

  const handlePaystack = async () => {
    if (!email) {
      return toast.warning("Email is required for bank.");
    }

    setIsProcessingWithBank(true);
    setIsOpen(false);

    const popup = new Paystack();
    popup.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PK_KEY,
      email,
      amount: Number(parseUnits(amount, 2)),
      onSuccess: async (transaction) => {
        setIsOpen(true);

        if (transaction.status == "success") {
          toast.loading("Onramping...");
          const mintHash = await adminClient.writeContract({
            abi: fiatAbi,
            address: pool.fiat,
            functionName: "mint",
            args: [adminClient.account.address, parseUnits(amount, 2)],
            chain: hederaTestnet,
            account: adminClient.account,
          });

          await publicClient.waitForTransactionReceipt({
            hash: mintHash,
          });

          toast.loading("Approving...");

          const approveHash = await adminClient.writeContract({
            abi: [
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "spender",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                name: "approve",
                outputs: [
                  {
                    internalType: "bool",
                    name: "response",
                    type: "bool",
                  },
                ],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            address: pool.fiatUnderlying,
            functionName: "approve",
            args: [pool.address, parseUnits(amount, 2)],
            chain: hederaTestnet,
            account: adminClient.account,
          });

          await publicClient.waitForTransactionReceipt({
            hash: approveHash,
          });

          if (action === "supply") {
            toast.loading("Supplying...");

            await adminClient.writeContract({
              abi: lendingPoolAbi,
              address: pool.address,
              functionName: "supply",
              args: [parseUnits(amount, 2), address],
              chain: hederaTestnet,
              account: adminClient.account,
            });

            await timelineService.createTimelinePost(address, {
              content: `You supplied ${Symbols[pool.address]}${amount} from bank.`,
              type: "activity",
            });
          } else {
            toast.loading("Repaying...");

            await adminClient.writeContract({
              abi: lendingPoolAbi,
              address: pool.address,
              functionName: "repay",
              args: [parseUnits(amount, 2), address],
              chain: hederaTestnet,
              account: adminClient.account,
            });

            const db = getFirestore();

            await timelineService.createTimelinePost(address, {
              content: `You repaid ${Symbols[pool.address]}${amount} from bank.`,
              type: "activity",
            });

            await updateDoc(doc(db, "farmers", address), {
              totalRepaid: increment(Number(amount)),
            });
          }
          toast.success(`Successful!`);
        } else {
          toast("Failed");
        }

        setAmount("");
        setEmail("");
        setIsOpen(false);
        setIsProcessingWithBank(false);
      },
      onCancel: () => {
        setIsOpen(true);
        toast("Cancelled");
        setIsProcessingWithBank(false);
      },
      onError: (error) => {
        setIsOpen(true);
        toast(error.message);
        setIsProcessingWithBank(false);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localStorage.getItem(`associated-${address}-${pool.fiatUnderlying}`)) {
      toast.loading("Associating...");

      const hash = await writeContract({
        abi: [
          {
            inputs: [],
            name: "associate",
            outputs: [
              {
                internalType: "uint256",
                name: "responseCode",
                type: "uint256",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        address: pool.fiatUnderlying,
        functionName: "associate",
        args: [],
      });

      localStorage.setItem(
        `associated-${address}-${pool.fiatUnderlying}`,
        hash
      );
    }

    if (action === "withdraw") {
      try {
        setIsProcessing(true);

        await writeContract({
          abi: lendingPoolAbi,
          address: pool.address,
          functionName: "withdrawSupply",
          args: [parseUnits(amount, 2)],
        });

        await timelineService.createTimelinePost(address, {
          content: `You withdraw ${Symbols[pool.address]}${amount} .`,
          type: "activity",
        });
      } catch (error) {
        toast(error?.message);
      } finally {
        setIsProcessing(false);
        setIsOpen(false);
        setAmount("");
      }
    } else if (action === "supply") {
      try {
        setIsProcessing(true);

        await approve();

        await writeContract({
          abi: lendingPoolAbi,
          address: pool.address,
          functionName: "supply",
          args: [parseUnits(amount, 2), address],
        });

        await timelineService.createTimelinePost(address, {
          content: `You supplied ${Symbols[pool.address]}${amount} .`,
          type: "activity",
        });
      } catch (error) {
        toast(error?.message);
      } finally {
        setIsProcessing(false);
        setIsOpen(false);
        setAmount("");
      }
    } else if (action === "borrow") {
      try {
        setIsProcessing(true);

        await writeContract({
          abi: lendingPoolAbi,
          address: pool.address,
          functionName: "borrow",
          args: [parseUnits(amount, 2)],
        });

        const db = getFirestore();
        await updateDoc(doc(db, "farmers", address), {
          totalBorrowed: increment(Number(amount)),
        });

        await timelineService.createTimelinePost(address, {
          content: `You borrowed ${Symbols[pool.address]}${amount} .`,
          type: "activity",
        });
      } catch (error) {
        toast(error?.message);
      } finally {
        setIsProcessing(false);
        setIsOpen(false);
        setAmount("");
      }
    } else if (action === "repay") {
      try {
        setIsProcessing(true);

        await approve();

        await writeContract({
          abi: lendingPoolAbi,
          address: pool.address,
          functionName: "repay",
          args: [parseUnits(amount, 2), address],
        });

        const db = getFirestore();
        await updateDoc(doc(db, "farmers", address), {
          totalRepaid: increment(Number(amount)),
        });

        await timelineService.createTimelinePost(address, {
          content: `You repaid ${Symbols[pool.address]}${amount}`,
          type: "activity",
        });
      } catch (error) {
        toast(error?.message);
      } finally {
        setIsProcessing(false);
        setIsOpen(false);
        setAmount("");
      }
    }
  };

  const calculateInterest = () => {
    if (!amount) return "0";
    const rate = action === "supply" ? pool.supplyAPY : pool.borrowAPY;
    return (
      (parseFloat(amount) * Number(formatUnits(rate, MAX_BPS_POW))) /
      100
    ).toFixed(2);
  };

  const getBorrowable = useCallback(async () => {
    try {
      const result = (await publicClient.readContract({
        abi: lendingPoolAbi,
        address: pool.address,
        functionName: "borrowable",
        args: [address],
        authorizationList: undefined,
      })) as bigint;

      setBorrowable(
        Number(formatUnits(result, 2)) -
          Number(formatUnits(pool.outstanding, 2))
      );
    } catch (error) {
      console.log(error);
    }
  }, [address, pool]);

  const getBalance = useCallback(async () => {
    try {
      const accountInfo = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${address}`
      );

      const info = await accountInfo.json();
      const token = (info?.balance?.tokens ?? []).find(
        (t) => t.token_id == pool.fiatUnderlyingId
      );

      setBalance(Number(formatUnits(token?.balance ?? 0n, 2)));
    } catch (error) {
      console.log(error);
    }
  }, [address, pool]);

  useEffect(() => {
    getBorrowable();
  }, [getBorrowable]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pool Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Pool Currency</span>
              <Badge variant="secondary">{pool.currency}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>{action === "supply" ? "Supply APY" : "Borrow APY"}</span>
              <span className="font-semibold text-green-600">
                {action === "supply"
                  ? Number(formatUnits(pool.supplyAPY, MAX_BPS_POW))
                  : Number(formatUnits(pool.borrowAPY, MAX_BPS_POW))}
                %
              </span>
            </div>
            {action === "borrow" && (
              <div className="flex justify-between text-sm">
                <span>Available Liquidity</span>
                <span className="font-semibold">
                  {Number(
                    formatUnits(pool.totalLiquidity - pool.totalBorrowed, 2)
                  ).toLocaleString()}{" "}
                  {pool.currency}
                </span>
              </div>
            )}
            {(action === "supply" || action === "withdraw") && (
              <div className="flex justify-between text-sm">
                <span>Supplied</span>
                <span className="font-semibold">
                  {Number(formatUnits(pool.lp, 2)).toLocaleString()}{" "}
                  {pool.currency}
                </span>
              </div>
            )}
            {(action === "borrow" || action === "repay") && (
              <div className="flex justify-between text-sm">
                <span>Outstanding</span>
                <span className="font-semibold">
                  {Number(formatUnits(pool.outstanding, 2)).toLocaleString()}{" "}
                  {pool.currency}
                </span>
              </div>
            )}
            {action === "borrow" && (
              <div className="flex justify-between text-sm">
                <span>Max Borrowable</span>
                <span className="font-semibold">
                  {borrowable.toLocaleString()} {pool.currency}
                </span>
              </div>
            )}
            {action === "supply" && (
              <div className="flex justify-between text-sm">
                <span>Available Balance</span>
                <span className="font-semibold">
                  {balance.toLocaleString()} {pool.currency}
                </span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({pool.currency})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {action === "borrow" && (
              <p className="text-xs text-muted-foreground">
                Maximum borrow based on your HBAR collateral
              </p>
            )}
          </div>

          {/* Transaction Summary */}
          {amount && (action === "borrow" || action === "supply") && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-semibold">
                    {amount} {pool.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {action === "supply" ? "Annual Interest" : "Annual Cost"}
                  </span>
                  <span
                    className={`font-semibold ${action === "supply" ? "text-green-600" : "text-red-600"}`}
                  >
                    {calculateInterest()} {pool.currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || isProcessingWithBank || !amount}
          >
            {isProcessing ? "Processing..." : `${config.buttonText} `}
          </Button>

          {/* Email Input */}
          {config.buttonText2 && (
            <Input
              id="email"
              type="email"
              placeholder="sarah@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {config.buttonText2 && (
            <Button
              type="button"
              onClick={handlePaystack}
              className="w-full bg-gray-800"
              disabled={isProcessing || isProcessingWithBank || !amount}
            >
              {isProcessingWithBank
                ? "Processing..."
                : `${config.buttonText2} `}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
