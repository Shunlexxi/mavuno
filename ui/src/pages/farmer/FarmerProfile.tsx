import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  MapPin,
  Calendar,
  Star,
  Edit,
  Camera,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { Farmer } from "../../types";
import { useState } from "react";

const achievements = [
  {
    title: "Verified Farmer",
    icon: Star,
    description: "Successfully verified account",
  },
  {
    title: "Sustainable Farming",
    icon: Award,
    description: "Certified sustainable practices",
  },
  {
    title: "Community Leader",
    icon: Users,
    description: "Mentored 10+ local farmers",
  },
  {
    title: "Top Performer",
    icon: TrendingUp,
    description: "98% repayment rate",
  },
];

export default function FarmerProfile() {
  const [farmer] = useState<Farmer | undefined>(undefined);

  if (!farmer) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Farmer Profile</h1>
        <Button className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={farmer.avatar} />
                <AvatarFallback className="text-2xl">
                  {farmer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full p-2"
              >
                <Camera className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold">{farmer.name}</h2>
                {farmer.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{farmer.location}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(farmer.createdAt).getFullYear()}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{4.5}/5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{farmer.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Farm Size
                  </Label>
                  <p className="font-semibold">{farmer.farmSize}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Primary Crops
                  </Label>
                  <p className="font-semibold">{farmer.cropType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₦{farmer.totalLoans.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Loans
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {Math.round((farmer.totalRepaid / farmer.totalLoans) * 100)}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Repayment Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">8</div>
                  <div className="text-xs text-muted-foreground">
                    Active Pledgers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2</div>
                  <div className="text-xs text-muted-foreground">
                    Completed Loans
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <achievement.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
