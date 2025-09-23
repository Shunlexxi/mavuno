import { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Search, MapPin, Heart, Users, Filter, Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFarmers } from "../../hooks/useFarmers";

export default function FarmersDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { farmers } = useFarmers({ searchTerm });

  const handleViewFarmer = (farmerId: string) => {
    navigate(`/pledger/farmers/${farmerId}`);
  };

  const handlePledge = (farmerId: string) => {
    navigate(`/pledger/pledge/${farmerId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Farmers Directory</h1>
        <p className="text-muted-foreground">
          Discover and support farmers in their agricultural journey
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers by name, crop type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Farmers Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {farmers.map((farmer) => (
          <Card key={farmer.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={farmer.avatar} />
                    <AvatarFallback>
                      {farmer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{farmer.name}</h3>
                      {farmer.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{farmer.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {farmer.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {farmer.cropType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {farmer.farmSize}
                  </Badge>
                </div>
              </div>

              {/* Farmer Stats */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Loans</span>
                  <span className="font-semibold">
                    ₦{farmer.totalLoans.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Rate</span>
                  <span className="font-semibold text-success">
                    {Math.round((farmer.totalRepaid / farmer.totalLoans) * 100)}
                    %
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Loan</span>
                  <span className="font-semibold">₦{0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleViewFarmer(farmer.id)}
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handlePledge(farmer.id)}
                >
                  <Heart className="w-4 h-4" />
                  Pledge Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {farmers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No farmers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find farmers.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
