import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Camera, Image, FileText, Calendar } from "lucide-react";

interface NewUpdateDialogProps {
  children: React.ReactNode;
}

export default function NewUpdateDialog({ children }: NewUpdateDialogProps) {
  const [content, setContent] = useState("");
  const [updateType, setUpdateType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const updateTypes = [
    { value: "general", label: "📝 General Update", color: "bg-secondary" },
    { value: "milestone", label: "🎯 Milestone", color: "bg-primary" },
    { value: "harvest", label: "🌾 Harvest", color: "bg-success" },
    { value: "request", label: "🤝 Request", color: "bg-warning" },
    { value: "achievement", label: "🏆 Achievement", color: "bg-purple-100" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate posting
    setTimeout(() => {
      setIsProcessing(false);
      setIsOpen(false);
      setContent("");
      setUpdateType("");
    }, 2000);
  };

  const selectedType = updateTypes.find((type) => type.value === updateType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Share New Update
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Share your farming progress with the community
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Update Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="updateType">Update Type</Label>
            <Select value={updateType} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                {updateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <Badge className={selectedType.color + " text-foreground"}>
                {selectedType.label}
              </Badge>
            )}
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Update</Label>
            <Textarea
              id="content"
              placeholder="Share what's happening on your farm, any milestones reached, or requests for support..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your progress, challenges, or achievements
            </p>
          </div>

          {/* Media Upload Section */}
          <div className="border border-dashed border-border rounded-lg p-4">
            <div className="text-center space-y-3">
              <div className="flex justify-center gap-2">
                <Camera className="w-8 h-8 text-muted-foreground" />
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Add Media (Optional)</h3>
                <p className="text-xs text-muted-foreground">
                  Photos and videos help tell your story better
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Image className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {(content || updateType) && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
              {selectedType && (
                <Badge className={selectedType.color + " text-foreground"}>
                  {selectedType.label}
                </Badge>
              )}
              {content && <p className="text-sm leading-relaxed">{content}</p>}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !content || !updateType}
          >
            {isProcessing ? "Posting Update..." : "Share Update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
