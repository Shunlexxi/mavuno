import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, ArrowLeft, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProducts } from "@/data/marketplaceData";
import { Product } from "@/types/marketplace";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function MarketplaceSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/farmer/marketplace/search?q=${encodeURIComponent(searchQuery)}`);
      const searchResults = searchProducts(searchQuery);
      setResults(searchResults);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
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

      <div className="mb-8">
        <form onSubmit={handleSearch}>
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
      </div>

      {searchQuery.trim() ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Search Results for "{searchQuery}"
            </h1>
            <p className="text-muted-foreground mt-1">
              {results.length} {results.length === 1 ? "product" : "products"} found
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">
                Try different keywords or browse categories
              </p>
              <Button onClick={() => navigate("/farmer/marketplace")}>
                Browse Marketplace
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() =>
                        navigate(`/farmer/marketplace/product/${product.id}`)
                      }
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
                        onClick={() =>
                          navigate(`/farmer/marketplace/product/${product.id}`)
                        }
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
                          {product.currency}{" "}
                          {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          navigate(`/farmer/marketplace/product/${product.id}`)
                        }
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
        </>
      ) : (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Start searching</h2>
          <p className="text-muted-foreground">
            Enter keywords to find products in the marketplace
          </p>
        </Card>
      )}
    </div>
  );
}

