import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  Heart,
  Shield,
  TrendingUp,
  Globe,
  ArrowRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
} from "lucide-react";
import heroImage from "@/assets/hero-farming.jpg";
import communityImage from "@/assets/community-web3.jpg";
import PoolActionDialog from "../components/dialogs/PoolActionDialog";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { usePools } from "../hooks/usePools";
import { formatUnits } from "viem";
import { MAX_BPS_POW } from "@/utils/constants";
import { useAccount } from "wagmi";
import { useFarmer } from "@/hooks/useFarmers";

export default function Landing() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { farmer } = useFarmer(address);
  const {
    pools,
    loading: poolsLoading,
    generateChartData,
    refetch,
  } = usePools(address);

  const features = [
    {
      icon: Shield,
      title: "Transparent & Secure",
      description:
        "Built on Hedera Hashgraph for fast, secure, and transparent transactions",
    },
    {
      icon: Heart,
      title: "Community-Driven",
      description:
        "Empowering communities to support local farmers through micro-lending",
    },
    {
      icon: TrendingUp,
      title: "Liquidity Provision",
      description:
        "Earn competitive yields by providing liquidity to lending pools",
    },
    {
      icon: Globe,
      title: "Financial Inclusion",
      description:
        "Bringing banking services to unbanked rural farming communities",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Mavuno</span>
          </div>
          <div className="flex items-center gap-3">
            <appkit-button />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Farmers working in green fields with modern technology"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70"></div>
        </div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="fade-in">
            <h1 className="hero-text mb-6">
              Empowering Farmers Through
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Community-Backed Lending
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Mavuno enables HBAR-backed loans for farmers while offering
              competitive yields to liquidity providers. Support sustainable
              agriculture through decentralized lending.
            </p>
          </div>

          <div className="slide-up flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              variant="hero"
              size="xl"
              className="gap-3"
              onClick={() => navigate("/farmer/register")}
            >
              <Sprout className="w-5 h-5" />
              I'm a Farmer
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline-hero"
              size="xl"
              className="gap-3"
              onClick={() => navigate("/pledger/dashboard")}
            >
              <Heart className="w-5 h-5" />
              Pledge HBAR
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Lending Pools Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lending Pools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Supply liquidity to earn interest or borrow against HBAR
              collateral. Multiple currencies available for diverse
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {poolsLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-muted rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : pools
                  .sort((a, b) =>
                    a.address == farmer?.preferredPool ||
                    b.address == farmer?.preferredPool
                      ? 1
                      : 0
                  )
                  .map((pool) => (
                    <Card
                      key={pool.address}
                      className={`hover:shadow-medium transition-all duration-300 ${pool.address == farmer?.preferredPool ? "border-green-300" : ""}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{pool.currency} Pool</span>
                          <div className="text-sm text-muted-foreground">
                            {pool.utilizationRate.toFixed(1)}% Utilized
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Chart */}
                        <div className="h-24 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={generateChartData(
                                Number(formatUnits(pool.supplyAPY, MAX_BPS_POW))
                              )}
                            >
                              <Line
                                type="monotone"
                                dataKey="apy"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                                fill="url(#gradientFill)"
                              />
                              <defs>
                                <linearGradient
                                  id="gradientFill"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Supply APY
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {Number(formatUnits(pool.supplyAPY, MAX_BPS_POW))}
                              %
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Borrow APY
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              {Number(formatUnits(pool.borrowAPY, MAX_BPS_POW))}
                              %
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">TVL</span>
                            <span className="font-medium">
                              {Number(
                                formatUnits(pool.totalLiquidity, 2)
                              ).toLocaleString()}{" "}
                              {pool.currency}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Supplied
                            </span>
                            <span className="font-medium">
                              {Number(formatUnits(pool.lp, 2)).toLocaleString()}{" "}
                              {pool.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Borrowed
                            </span>
                            <span className="font-medium">
                              {Number(
                                formatUnits(pool.borrow, 2)
                              ).toLocaleString()}{" "}
                              {pool.currency} (
                              {Number(
                                formatUnits(pool.outstanding - pool.borrow, 2)
                              ).toLocaleString()}{" "}
                              {pool.currency})
                            </span>
                          </div>
                        </div>
                        {pool.address !== farmer?.preferredPool && (
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <PoolActionDialog
                              pool={pool}
                              action="supply"
                              onClose={() => {
                                refetch(address);
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                <ArrowUpCircle className="w-3 h-3" />
                                Supply
                              </Button>
                            </PoolActionDialog>
                            <PoolActionDialog
                              pool={pool}
                              action="withdraw"
                              onClose={() => {
                                refetch(address);
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                <Minus className="w-3 h-3" />
                                Withdraw
                              </Button>
                            </PoolActionDialog>
                          </div>
                        )}
                        {pool.address === farmer?.preferredPool && (
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <PoolActionDialog
                              pool={pool}
                              action="borrow"
                              onClose={() => {
                                refetch(address);
                              }}
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                              >
                                <ArrowDownCircle className="w-3 h-3" />
                                Borrow
                              </Button>
                            </PoolActionDialog>

                            <PoolActionDialog
                              pool={pool}
                              action="repay"
                              onClose={() => {
                                refetch(address);
                              }}
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                              >
                                <TrendingUp className="w-3 h-3" />
                                Repay
                              </Button>
                            </PoolActionDialog>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Mavuno?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building the future of agricultural finance through
              blockchain technology and community support.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <img
                src={communityImage}
                alt="Web3 community connecting farmers and pledgers"
                className="w-full h-auto rounded-2xl shadow-medium"
              />
            </div>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="fade-in">
              <div className="text-4xl font-bold text-primary mb-2">
                2.5M+ Hbar
              </div>
              <div className="text-muted-foreground">Backed Loans</div>
            </div>
            <div className="fade-in">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground">Active Farmers</div>
            </div>
            <div className="fade-in">
              <div className="text-4xl font-bold text-primary mb-2">300+</div>
              <div className="text-muted-foreground">Community Pledgers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of people building sustainable agricultural
            communities through Web3 technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate("/farmer/register")}
            >
              Get Started as Farmer
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate("/pledger/dashboard")}
            >
              Start Pledging Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Mavuno</span>
          </div>
          <p className="text-muted-foreground">
            Building the future of agricultural finance through Web3 technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
