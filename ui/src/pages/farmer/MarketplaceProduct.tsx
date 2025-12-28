import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  Package,
  Minus,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "@/data/marketplaceData";
import { Product, RentalProduct } from "@/types/marketplace";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketplaceProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="p-6">
        <p>Product not found</p>
      </div>
    );
  }

  const isRental = product.category === "rentals";
  const rentalProduct = isRental ? (product as RentalProduct) : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const increaseQuantity = () => {
    if (product.inStock && (!product.stockQuantity || quantity < product.stockQuantity)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

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

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {product.isNew && (
                <Badge className="mb-2 bg-green-500">NEW</Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium ml-1">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {product.merchant.name}
                </span>
                {product.merchant.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-bold">
                {product.currency} {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.currency} {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.discount && (
                <Badge className="bg-red-500 text-lg">
                  {product.discount}% OFF
                </Badge>
              )}
            </div>
            {isRental && rentalProduct && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Rental Rates:</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {rentalProduct.dailyRate && (
                    <div>
                      <span className="text-muted-foreground">Daily:</span>
                      <span className="font-semibold ml-1">
                        {product.currency} {rentalProduct.dailyRate.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {rentalProduct.weeklyRate && (
                    <div>
                      <span className="text-muted-foreground">Weekly:</span>
                      <span className="font-semibold ml-1">
                        {product.currency} {rentalProduct.weeklyRate.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {rentalProduct.monthlyRate && (
                    <div>
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="font-semibold ml-1">
                        {product.currency} {rentalProduct.monthlyRate.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {rentalProduct.requiresDeposit && rentalProduct.depositAmount && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Deposit required: {product.currency}{" "}
                    {rentalProduct.depositAmount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  In Stock
                  {product.stockQuantity && ` (${product.stockQuantity} available)`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 mb-4">
                <span className="font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isRental && (
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2 border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={
                    !product.inStock ||
                    (product.stockQuantity !== undefined &&
                      quantity >= product.stockQuantity)
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isRental ? "Request Rental" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/farmer/marketplace/cart")}
            >
              View Cart
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">Delivery</p>
                <p className="text-xs text-muted-foreground">
                  {product.deliveryTime || "3-5 days"}
                </p>
              </div>
            </div>
            {product.warranty && (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Warranty</p>
                  <p className="text-xs text-muted-foreground">
                    {product.warranty}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">Verified</p>
                <p className="text-xs text-muted-foreground">Merchant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="merchant">Merchant Info</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {product.specifications ? (
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="font-medium text-sm text-muted-foreground">
                        {key}
                      </dt>
                      <dd className="mt-1">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-muted-foreground">
                  No specifications available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="merchant" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {product.merchant.name}
                  </h3>
                  {product.merchant.verified && (
                    <Badge className="mb-2">Verified Merchant</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{product.merchant.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.merchant.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="font-medium">
                      {product.merchant.totalSales} orders
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

