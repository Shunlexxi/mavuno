import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, ArrowLeft, Filter } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductsByCategory } from "@/data/marketplaceData";
import { categoryLabels, categoryIcons, ProductCategory } from "@/types/marketplace";
import { Product } from "@/types/marketplace";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MarketplaceCategory() {
  const { category } = useParams<{ category: ProductCategory }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");

  if (!category || !categoryLabels[category]) {
    return (
      <div className="p-6">
        <p>Category not found</p>
      </div>
    );
  }

  let products = getProductsByCategory(category);

  // Apply filters
  if (sortBy === "price-low") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    products = products.filter((p) => {
      if (max) {
        return p.price >= min && p.price <= max;
      }
      return p.price >= min;
    });
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/farmer/marketplace")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{categoryIcons[category]}</div>
          <div>
            <h1 className="text-3xl font-bold">{categoryLabels[category]}</h1>
            <p className="text-muted-foreground">
              {products.length} products available
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Price:</span>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-5000">Under ₦5,000</SelectItem>
              <SelectItem value="5000-10000">₦5,000 - ₦10,000</SelectItem>
              <SelectItem value="10000-25000">₦10,000 - ₦25,000</SelectItem>
              <SelectItem value="25000-50000">₦25,000 - ₦50,000</SelectItem>
              <SelectItem value="50000">Above ₦50,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No products found in this category.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/farmer/marketplace/product/${product.id}`)}
                />
                {product.discount && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    {product.discount}% OFF
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    NEW
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3
                    className="font-semibold text-sm line-clamp-2 mb-1 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/farmer/marketplace/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-lg font-bold">
                    {product.currency} {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through ml-2">
                      {product.currency} {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/farmer/marketplace/product/${product.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

