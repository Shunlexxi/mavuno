import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  Heart,
  DollarSign,
  Users,
  ArrowUpRight,
  Plus,
  Eye,
} from "lucide-react";
import PledgeActionDialog from "@/components/dialogs/PledgeActionDialog";
import { usePledges, usePledgeStats } from "@/hooks/usePledges";

export default function PledgerDashboard() {
  const currentUserId = "current-user"; // In real app, this would come from auth
  const { stats } = usePledgeStats(currentUserId);
  const { pledges, loading } = usePledges({ pledgerId: currentUserId });

  const dashboardStats = [
    {
      title: "Total Pledged",
      value: `${stats?.totalPledged?.toLocaleString() || 0} HBAR`,
      change: "Supporting rural farmers",
      icon: Heart,
      color: "text-primary",
    },
    {
      title: "Active Pledges",
      value: stats?.activePledges?.toString() || "0",
      change: "Currently backing farmers",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Locked Pledges",
      value: stats?.lockedPledges?.toString() || "0",
      change: "Securing active loans",
      icon: TrendingUp,
      color: "text-warning",
    },
    {
      title: "Available to Pledge",
      value: "2,500 HBAR",
      change: "Ready for next cycle",
      icon: DollarSign,
      color: "text-success",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pledger Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your pledges and support farmers in their journey.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Browse Farmers
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Pledge
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Pledges */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Pledges</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading
              ? // Loading skeleton
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                ))
              : pledges
                  .filter((p) => p.status === "active")
                  .map((pledge) => (
                    <div
                      key={pledge.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={pledge.farmer.avatar} />
                          <AvatarFallback>
                            {pledge.farmer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {pledge.farmer.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {pledge.farmer.cropType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {pledge.amount.toLocaleString()} {pledge.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pledge.status === "locked"
                            ? "Securing Loan"
                            : "Available"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pledge.status === "locked" && (
                          <Badge variant="outline" className="text-warning">
                            Locked Until{" "}
                            {new Date(
                              pledge.lockEndDate || ""
                            ).toLocaleDateString()}
                          </Badge>
                        )}
                        {pledge.canWithdraw && (
                          <Badge variant="secondary" className="text-success">
                            Can Withdraw
                          </Badge>
                        )}
                        <PledgeActionDialog
                          farmer={pledge.farmer}
                          action="increase"
                          currentPledge={pledge.amount}
                        >
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </PledgeActionDialog>
                      </div>
                    </div>
                  ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3" variant="outline">
              <Heart className="w-4 h-4" />
              Find New Farmers
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline">
              <Plus className="w-4 h-4" />
              Increase Pledge
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline">
              <DollarSign className="w-4 h-4" />
              Withdraw HBAR
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline">
              <Users className="w-4 h-4" />
              View Pool Positions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  HBAR pledge secured loan for Sarah Okafor - 5,000 HBAR
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  New update from John Adebayo - Harvest milestone achieved
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  Pledge available for withdrawal - 3,000 HBAR unlocked
                </p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
