import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Plus,
  MessageSquare
} from 'lucide-react';

export default function FarmerDashboard() {
  const stats = [
    {
      title: 'Current Loan',
      value: '₦15,000',
      change: '+5% from last month',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      title: 'Total Repaid',
      value: '₦40,000',
      change: '+12% from last month',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Days Remaining',
      value: '45',
      change: 'Current loan period',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'Active Pledgers',
      value: '8',
      change: '+2 new this week',
      icon: TrendingUp,
      color: 'text-primary'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your farm today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            New Update
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Request Loan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Timeline Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Your latest harvest update received 24 likes</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">New pledger joined your campaign</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Loan repayment reminder - 7 days left</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="font-semibold">₦15,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Interest Rate</span>
                <span className="font-semibold">5% APR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Repayment Due</span>
                <Badge variant="secondary">45 days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Due</span>
                <span className="font-semibold text-lg">₦15,750</span>
              </div>
              <div className="pt-4">
                <Button className="w-full">Make Payment</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}