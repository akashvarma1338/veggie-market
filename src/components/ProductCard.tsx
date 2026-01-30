import { Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  variety: string;
  price: number;
  image: string;
  farmer: {
    name: string;
    location: string;
    rating: number;
  };
  inStock: boolean;
  organic?: boolean;
  highlightTerm?: string;
}

export function ProductCard({ 
  id,
  name, 
  variety, 
  price, 
  image, 
  farmer, 
  inStock, 
  organic = false,
  highlightTerm = '' 
}: ProductCardProps) {
  const { addItem, setIsCartOpen } = useCart();

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text: string) => {
    if (!highlightTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(highlightTerm)})`, 'ig');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === highlightTerm.toLowerCase()
        ? <mark key={i} className="bg-primary/20 rounded px-1">{part}</mark>
        : part
    );
  };

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      variety,
      price,
      image,
      farmer: {
        name: farmer.name,
        location: farmer.location
      }
    });
    toast.success(`${name} added to cart!`);
    setIsCartOpen(true);
  };
  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
        {organic && (
          <Badge className="absolute top-3 left-3 bg-tropical-green text-white">
            Organic
          </Badge>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{highlight(name)}</h3>
            <p className="text-muted-foreground text-sm">{highlight(variety)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{highlight(farmer.location)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-mango-yellow text-mango-yellow" />
              <span className="text-sm font-medium">{farmer.rating}</span>
              <span className="text-sm text-muted-foreground">• {farmer.name}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-primary">₹{price}</span>
              <span className="text-muted-foreground">/kg</span>
            </div>
            <Button 
              disabled={!inStock}
              className="bg-gradient-tropical hover:opacity-90 transition-opacity"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}