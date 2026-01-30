import { MapPin, Star, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FarmerCardProps {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  specialties: string[];
  deliveryDays: number;
  verified?: boolean;
  highlightTerm?: string;
}

export function FarmerCard({ 
  name, 
  location, 
  rating, 
  reviewCount, 
  image, 
  specialties, 
  deliveryDays,
  verified = false,
  highlightTerm = ''
}: FarmerCardProps) {
  const escapeRegExp = (s: string) => s.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&');
  const highlight = (text: string) => {
    if (!highlightTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(highlightTerm)})`, 'ig');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === highlightTerm.toLowerCase()
        ? <mark key={i} className="bg-primary/20 rounded px-1">{part}</mark>
        : part
    );
  };
  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-32 object-cover"
        />
        {verified && (
          <Badge className="absolute top-2 right-2 bg-tropical-green text-white text-xs">
            Verified
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{highlight(name)}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{highlight(location)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-mango-yellow text-mango-yellow" />
            <span className="font-medium text-sm">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {highlight(specialty)}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{specialties.length - 2} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Truck className="h-3 w-3" />
            <span>{deliveryDays} days delivery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}