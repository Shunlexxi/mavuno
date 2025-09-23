import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Wallet, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Pool } from "../../types";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const actionConfig = {
    supply: {
      title: `Supply ${pool.currency}`,
      description: `Add liquidity to the ${pool.currency} pool and earn interest`,
      buttonText: "Supply",
      icon: DollarSign,
      color: "text-green-600",
    },
    borrow: {
      title: `Borrow ${pool.currency}`,
      description: `Borrow ${pool.currency} against your HBAR collateral`,
      buttonText: "Borrow",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    withdraw: {
      title: `Withdraw ${pool.currency}`,
      description: `Remove your supplied ${pool.currency} from the pool`,
      buttonText: "Withdraw",
      icon: Wallet,
      color: "text-orange-600",
    },
    repay: {
      title: `Repay ${pool.currency}`,
      description: `Repay your borrowed ${pool.currency}`,
      buttonText: "Repay",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  };

  const config = actionConfig[action];
  const IconComponent = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate transaction
    setTimeout(() => {
      setIsProcessing(false);
      setIsOpen(false);
      setAmount("");
    }, 2000);
  };

  const calculateInterest = () => {
    if (!amount) return "0";
    const rate = action === "supply" ? pool.supplyAPY : pool.borrowAPY;
    return ((parseFloat(amount) * rate) / 100).toFixed(2);
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
          {/* Pool Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Pool Currency</span>
              <Badge variant="secondary">{pool.currency}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>{action === "supply" ? "Supply APY" : "Borrow APY"}</span>
              <span className="font-semibold text-green-600">
                {action === "supply" ? pool.supplyAPY : pool.borrowAPY}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Available Liquidity</span>
              <span className="font-semibold">
                {pool.totalLiquidity.toLocaleString()} {pool.currency}
              </span>
            </div>
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
          {amount && (
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
            disabled={isProcessing || !amount}
          >
            {isProcessing
              ? "Processing..."
              : `${config.buttonText} ${amount || "0"} ${pool.currency}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
