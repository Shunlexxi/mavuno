import { SidebarTrigger } from "../ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { useCart } from "@/contexts/CartContext";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const isFarmerRoute = location.pathname.startsWith("/farmer");
  const cartItemsCount = getTotalItems();

  return (
    <header className="sticky top-0 bg-white h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-lg">Mavuno</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isFarmerRoute && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/farmer/marketplace/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {cartItemsCount > 9 ? "9+" : cartItemsCount}
              </Badge>
            )}
          </Button>
        )}
        <appkit-button />
      </div>
    </header>
  );
}
