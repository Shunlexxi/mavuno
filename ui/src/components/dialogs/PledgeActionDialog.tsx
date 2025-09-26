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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Plus, Minus, AlertTriangle, Info } from "lucide-react";
import { Farmer } from "@/types";
import { toast } from "sonner";
import { useWriteContract } from "@/utils/hedera";
import { useAccount } from "wagmi";
import { pledgeManagerAbi } from "@/abis/pledgeManager";
import { Hbar, HbarUnit } from "@hashgraph/sdk";
import { parseUnits } from "viem";
import pledgesService from "@/services/pledgesService";
import { publicClient } from "@/utils/constants";

interface PledgeActionDialogProps {
  farmer: Partial<Farmer>;
  action: "increase" | "withdraw";
  currentPledge?: number;
  children: React.ReactNode;
  onClose: () => void;
}

export default function PledgeActionDialog({
  farmer,
  action,
  currentPledge = 0,
  children,
  onClose,
}: PledgeActionDialogProps) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(true);

  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  const getPledgeStatus = useCallback(async () => {
    const result = (await publicClient.readContract({
      abi: pledgeManagerAbi,
      address: farmer.pledgeManager,
      functionName: "active",
      authorizationList: undefined,
    })) as boolean;

    setActive(result);
  }, [farmer]);

  useEffect(() => {
    getPledgeStatus();
  }, [getPledgeStatus]);

  const actionConfig = {
    pledge: {
      title: `Pledge HBAR to ${farmer.name}`,
      description: "Support this farmer with HBAR collateral for their loans",
      buttonText: "Create Pledge",
      icon: Heart,
      color: "text-primary",
    },
    increase: {
      title: `Increase Pledge to ${farmer.name}`,
      description: "Add more HBAR to your existing pledge",
      buttonText: "Increase Pledge",
      icon: Plus,
      color: "text-green-600",
    },
    withdraw: {
      title: `Withdraw Pledge from ${farmer.name}`,
      description: "Remove HBAR from your pledge (only when not locked)",
      buttonText: "Withdraw",
      icon: Minus,
      color: "text-orange-600",
    },
  };

  const config = actionConfig[action];
  const IconComponent = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (action === "increase") {
      try {
        setIsProcessing(true);

        await writeContract({
          abi: pledgeManagerAbi,
          address: farmer.pledgeManager,
          functionName: "pledge",
          args: [address],
          value: parseUnits(amount, 8),
          metaArgs: {
            amount: Hbar.from(amount, HbarUnit.Hbar),
          },
        });

        await pledgesService.createPledge(address, {
          farmerAddress: farmer.address,
          amount: Number(amount),
          currency: "HBAR",
        });

        setAmount("");
        setIsOpen(false);
        onClose();
      } catch (error) {
        toast.error(error?.message);
      } finally {
        setIsProcessing(false);
      }
    } else if (action === "withdraw") {
      try {
        setIsProcessing(true);

        await writeContract({
          abi: pledgeManagerAbi,
          address: farmer.pledgeManager,
          functionName: "withdraw",
          args: [parseUnits(amount, 8)],
        });

        await pledgesService.decreasePledge(address, {
          farmerAddress: farmer.address,
          amount: Number(amount),
          currency: "HBAR",
        });

        setAmount("");
        setIsOpen(false);
        onClose();
      } catch (error) {
        toast.error(error?.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getNewTotal = () => {
    if (!amount) return currentPledge;
    const amountNum = parseFloat(amount);
    if (action === "withdraw") {
      return Math.max(0, currentPledge - amountNum);
    }
    return currentPledge + amountNum;
  };

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
          {/* Farmer Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={"/images/avatar.png"} />
                <AvatarFallback>
                  {farmer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{farmer.name}</h3>
                  {farmer.verified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {farmer.location}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{farmer.cropType}</span>
                  <span>•</span>
                  <span>{farmer.farmSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Pledge Info */}
          {currentPledge > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium">Current Pledge</span>
              <Badge variant="outline" className="text-blue-700">
                {currentPledge.toLocaleString()} HBAR
              </Badge>
            </div>
          )}

          {action === "withdraw" && active && (
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-sm font-medium">Active Pledge</span>
              <Badge variant="outline" className="text-red-700">
                Cannot Withdraw
              </Badge>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              {action === "withdraw" ? "Withdraw Amount" : "Pledge Amount"}{" "}
              (HBAR)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              max={action === "withdraw" ? currentPledge : undefined}
            />

            {action === "withdraw" && (
              <p className="text-xs text-muted-foreground">
                Maximum withdraw: {currentPledge.toLocaleString()} HBAR
              </p>
            )}
          </div>

          {/* Transaction Summary */}
          {amount && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction Amount</span>
                  <span className="font-semibold">{amount} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span>New Total Pledge</span>
                  <span className="font-semibold text-primary">
                    {getNewTotal().toLocaleString()} HBAR
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning for withdrawal */}
          {action === "withdraw" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-1">Withdrawal Terms</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Only available when not securing active loans</li>
                    <li>• May have a waiting period for processing</li>
                    <li>• Partial withdrawals allowed</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Info for pledging */}
          {action !== "withdraw" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Pledge Benefits</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Help farmers access better loan terms</li>
                    <li>• Possible rewards from grateful farmers</li>
                    <li>• Support sustainable agriculture</li>
                    <li>• Withdrawable between loan cycles</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              isProcessing || !amount || (action === "withdraw" && active)
            }
          >
            {isProcessing
              ? "Processing..."
              : `${config.buttonText} ${amount || "0"} HBAR`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
