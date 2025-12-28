import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function MarketplaceCart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    // In a real app, this would navigate to checkout or process payment
    toast.success("Checkout initiated! This would process payment with your loan.");
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/farmer/marketplace")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        <Card className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your cart
          </p>
          <Button onClick={() => navigate("/farmer/marketplace")}>
            Browse Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const currency = items[0]?.product.currency || "NGN";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/farmer/marketplace")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Button variant="ghost" onClick={clearCart} className="text-red-600">
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3
                            className="font-semibold cursor-pointer hover:text-primary"
                            onClick={() =>
                              navigate(`/farmer/marketplace/product/${item.product.id}`)
                            }
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product.merchant.name}
                          </p>
                          <p className="text-lg font-bold mt-2">
                            {currency} {item.product.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={
                              item.product.stockQuantity !== undefined &&
                              item.quantity >= item.product.stockQuantity
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-lg font-bold">
                          {currency}{" "}
                          {(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {currency} {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mavuno Discount</span>
                  <Badge className="bg-green-500">Applied</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {currency} {totalPrice.toLocaleString()}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>

              <div className="pt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pay with Loan</p>
                    <p className="text-muted-foreground text-xs">
                      Use your approved Mavuno loan to pay
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-muted-foreground text-xs">
                      Delivery within 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

