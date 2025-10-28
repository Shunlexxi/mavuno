import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Star,
  Camera,
  TrendingUp,
  Users,
  Award,
  Loader,
  Heart,
  BotIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { usePledges } from "@/hooks/usePledges";
import { useFarmer } from "@/hooks/useFarmers";
import { Symbols } from "@/utils/constants";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTimeline } from "@/hooks/useTimeline";
import { formatDistanceToNow } from "date-fns";
import { generateFarmerSummary } from "@/services/aiService";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function FarmerPage() {
  const { farmerAddress } = useParams();
  const { farmer, loading: loadingFarmer } = useFarmer(
    farmerAddress as `0x${string}`
  );
  const { pledges } = usePledges({ farmerAddress });
  const { posts } = useTimeline({
    address: farmerAddress,
    type: "update",
  });
  const [analysis, setAnalysis] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const analyzeFarmer = async () => {
    setIsReplying(true);
    const result = await generateFarmerSummary(
      JSON.stringify({
        farmerAddress,
        farmer,
        posts,
        pledges,
        poolsCurrencySymbols: Symbols,
      })
    );

    if (result) {
      setAnalysis(result);
    } else {
      toast.error("Gemini: Failed to generate summary.");
    }

    setIsReplying(false);
  };

  const achievements = useMemo(
    () => [
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
        description: loadingFarmer
          ? "•••"
          : `${Math.round(
              (farmer?.totalRepaid / farmer?.totalBorrowed) * 100
            )}% repayment rate`,
      },
    ],
    [farmer, loadingFarmer]
  );

  if (loadingFarmer)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Farmer Profile</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-2" variant="outline" onClick={analyzeFarmer}>
            <BotIcon className="w-4 h-4" />
            AI: Analyze Farmer
          </Button>

          <Link to={`/pledger/pledge/${farmerAddress}`}>
            <Button className="gap-2">
              <Heart className="w-4 h-4" />
              Pledge
            </Button>
          </Link>
        </div>
      </div>

      {(analysis.length > 0 || isReplying) && (
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BotIcon className="w-3 h-3" />
                <span>AI Response</span>
                <span>•</span>
                <span>Google Gemini</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              <ReactMarkdown>
                {isReplying ? "Thinking..." : analysis}
              </ReactMarkdown>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={"/images/avater.png"} />
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
                    {Symbols[farmer?.preferredPool]}
                    {farmer.totalBorrowed.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Borrowed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {Math.round(
                      (farmer.totalRepaid / farmer.totalBorrowed) * 100
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Repayment Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {pledges?.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active Pledgers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Symbols[farmer?.preferredPool]}
                    {farmer.totalRepaid.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Repaid
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

      {/* Timeline Posts */}
      <div className="space-y-6 mt-6">
        {posts.map((post) => (
          <Card key={post.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{post.farmer.location}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div
                  className={`grid gap-2 ${
                    post.images.length === 1
                      ? "grid-cols-1"
                      : post.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-muted rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                  onClick={() => (post.likes = post.likes + 1)}
                >
                  <Heart className="w-4 h-4" />
                  {post.likes} Likes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments} Comments
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
