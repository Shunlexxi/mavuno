import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, ShoppingCart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllProducts,
  getFeaturedProducts,
} from "@/data/marketplaceData";
import {
  categoryLabels,
  categoryIcons,
  ProductCategory,
} from "@/types/marketplace";
import { Product } from "@/types/marketplace";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function Marketplace() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const featuredProducts = getFeaturedProducts();

  const categories: ProductCategory[] = [
    "seeds",
    "fertilizers",
    "tools",
    "equipment",
    "pesticides",
    "rentals",
  ];

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/farmer/marketplace/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Farm Marketplace</h1>
        <p className="text-muted-foreground">
          Access verified farm inputs, tools, and equipment at discounted prices
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for seeds, fertilizers, tools, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </form>

      {/* Categories Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category}
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => navigate(`/farmer/marketplace/category/${category}`)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {categoryIcons[category]}
                </div>
                <h3 className="font-semibold">{categoryLabels[category]}</h3>
                <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/farmer/marketplace/all")}
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
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
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold">
                      {product.currency} {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-2">
                        {product.currency} {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/farmer/marketplace/product/${product.id}`)}
                  >
                    View
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
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Why Shop with Mavuno?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-1">✅ Verified Merchants</h4>
              <p className="text-sm text-muted-foreground">
                All suppliers are verified and trusted
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">💰 Partner Discounts</h4>
              <p className="text-sm text-muted-foreground">
                Exclusive discounts for Mavuno farmers
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">💳 Pay with Loans</h4>
              <p className="text-sm text-muted-foreground">
                Use your approved loan to purchase directly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

