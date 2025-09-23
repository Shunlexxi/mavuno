import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Sprout, Mail, Lock, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FarmerAuthProps {
  mode: "login" | "register";
}

export default function FarmerAuth({ mode }: FarmerAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/farmer/dashboard");
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">Mavuno</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {mode === "login"
              ? "Welcome Back, Farmer!"
              : "Join Mavuno as a Farmer"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your farm and connect with pledgers"
              : "Start your journey with community-backed micro-lending"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "login" ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your farmer dashboard"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Sarah Okafor"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Farm Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Kaduna State, Nigeria"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 hectares</SelectItem>
                          <SelectItem value="3-5">3-5 hectares</SelectItem>
                          <SelectItem value="6-10">6-10 hectares</SelectItem>
                          <SelectItem value="10+">10+ hectares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cropType">Primary Crop</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maize">Maize</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="cassava">Cassava</SelectItem>
                          <SelectItem value="yam">Yam</SelectItem>
                          <SelectItem value="beans">Beans</SelectItem>
                          <SelectItem value="soybean">Soybean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredPool">
                      Preferred Lending Pool
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency pool" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">
                          NGN (Nigerian Naira)
                        </SelectItem>
                        <SelectItem value="CEDI">
                          CEDI (Ghanaian Cedi)
                        </SelectItem>
                        <SelectItem value="RAND">
                          RAND (South African Rand)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the currency pool you'd like to borrow from
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">About Your Farm</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your farming experience and goals..."
                      className="min-h-[80px]"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() =>
                    navigate(
                      mode === "login" ? "/farmer/register" : "/farmer/login"
                    )
                  }
                >
                  {mode === "login" ? "Register here" : "Sign in"}
                </Button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={handleBackToHome}>
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
