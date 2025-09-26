import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Heart, MapPin, Star, Info, Calculator } from "lucide-react";
import { useFarmer } from "@/hooks/useFarmers";
import { Hex, parseEther } from "viem";
import { toast } from "sonner";
import { useWriteContract } from "@/utils/hedera";
import { pledgeManagerAbi } from "@/abis/pledgeManager";
import { Hbar, HbarUnit } from "@hashgraph/sdk";
import { useAccount } from "wagmi";
import pledgesService from "@/services/pledgesService";
import { Symbols } from "@/utils/constants";

export default function PledgePage() {
  const { farmerAddress } = useParams();
  const navigate = useNavigate();
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [currency] = useState("HBAR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { farmer, loading } = useFarmer(farmerAddress as Hex);
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Farmer Not Found</h1>
        <Button onClick={() => navigate("/pledger/farmers")}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      await writeContract({
        abi: pledgeManagerAbi,
        address: farmer.pledgeManager,
        functionName: "pledge",
        args: [address],
        value: parseEther(pledgeAmount),
        metaArgs: {
          amount: Hbar.from(pledgeAmount, HbarUnit.Hbar),
        },
      });

      await pledgesService.createPledge(address, {
        farmerAddress: farmerAddress as Hex,
        amount: Number(pledgeAmount),
        currency: "HBAR",
      });

      navigate("/pledger/dashboard");
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Make a Pledge</h1>
        <p className="text-muted-foreground">
          Support {farmer.name} in their farming journey
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Farmer Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={"/images/avatar.png"} />
                <AvatarFallback>
                  {farmer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{farmer.name}</h2>
                  {farmer.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{farmer.location}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{farmer.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Farm Size
                </Label>
                <p className="font-semibold">{farmer.farmSize}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Crop Type
                </Label>
                <p className="font-semibold">{farmer.cropType}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Borrowed</span>
                <span className="font-semibold">
                  {Symbols[farmer?.preferredPool]}
                  {farmer.totalBorrowed.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Repaid</span>
                <span className="font-semibold text-success">
                  {Symbols[farmer?.preferredPool]}
                  {farmer.totalRepaid.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pledge Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Create Pledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="HBAR (Only)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HBAR">HBAR</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pledges can only be made in HBAR to secure loans
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Pledge Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  required
                />
              </div>

              {pledgeAmount && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Pledge Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Pledge Amount</span>
                        <span className="font-semibold">
                          {pledgeAmount} {currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Purpose</span>
                        <span className="font-semibold">Loan Collateral</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Farmer Incentive</span>
                        <span className="font-semibold text-primary">
                          Discount coupon
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Pledge Terms</p>
                    <ul className="space-y-1 text-xs">
                      <li>• HBAR pledged as collateral for farmer loans</li>
                      <li>• Locked during active loan periods</li>
                      <li>• Withdrawable between seasons</li>
                      <li>• Farmers may offer produce/incentives</li>
                      <li>• No guaranteed financial returns</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing Pledge..."
                  : `Pledge ${pledgeAmount || "0"} ${currency}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
