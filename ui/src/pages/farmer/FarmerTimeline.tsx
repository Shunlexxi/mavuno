import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Camera,
  Plus,
  MapPin,
  Calendar,
  Loader,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTimeline } from "@/hooks/useTimeline";
import { useFarmer } from "@/hooks/useFarmers";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function FarmerTimeline() {
  const [newPost, setNewPost] = useState("");
  const { address } = useAccount();
  const { farmer, loading: loadingFarmer } = useFarmer(address);
  const { posts, loading, createPost } = useTimeline({
    address,
    type: "update",
  });

  const handlePost = async () => {
    try {
      await createPost(address, {
        content: newPost,
        type: "update",
      });

      setNewPost("");
    } catch (error) {
      toast.error(error?.message);
    }
  };

  if (loadingFarmer)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Timeline</h1>
        <p className="text-muted-foreground">
          Share your farming journey with the community
        </p>
      </div>

      {/* Create Post */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={"/images/avatar.png"} />
              <AvatarFallback>
                {farmer?.name
                  ?.split(" ")
                  ?.map((n) => n[0])
                  ?.join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{farmer?.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{farmer?.location}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share an update about your farm, crops, or community..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="w-4 h-4" />
                Add Photos
              </Button>
            </div>
            <Button onClick={handlePost}>Share Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Posts */}
      <div className="space-y-6">
        {loading
          ? // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          : posts.map((post) => (
              <Card key={post.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={"/images/avatar.png"} />
                        <AvatarFallback>
                          {post.farmer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.farmer.name}</h3>
                          {post.farmer.verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
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
