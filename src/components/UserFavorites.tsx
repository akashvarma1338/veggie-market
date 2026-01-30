import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteItem {
  id: string;
  name: string;
  image: string;
  price: number;
  type: 'product' | 'farmer';
}

export function UserFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    // Load favorites from localStorage for now
    // In a real app, this would come from the database
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user]);

  const removeFavorite = (itemId: string) => {
    const updatedFavorites = favorites.filter(item => item.id !== itemId);
    setFavorites(updatedFavorites);
    
    if (user) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    }
    
    toast.success('Removed from favorites');
  };

  const addToFavorites = (item: FavoriteItem) => {
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }

    const isAlreadyFavorite = favorites.some(fav => fav.id === item.id);
    if (isAlreadyFavorite) {
      toast.info('Already in favorites');
      return;
    }

    const updatedFavorites = [...favorites, item];
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    toast.success('Added to favorites');
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please log in to view your favorites.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Favorites</h3>
        <div className="text-sm text-muted-foreground">
          {favorites.length} item{favorites.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((item) => (
          <Card key={item.id} className="relative">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">{item.name}</h4>
                {item.type === 'product' && (
                  <p className="text-lg font-bold text-primary">₹{item.price}</p>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => removeFavorite(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                onClick={() => removeFavorite(item.id)}
              >
                <Heart className="h-5 w-5 fill-current" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {favorites.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No favorites yet. Start exploring and save your favorite vegetables and farmers!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Export helper functions for other components to use
export const useFavorites = () => {
  const { user } = useAuth();
  
  const addToFavorites = (item: FavoriteItem) => {
    if (!user) {
      toast.error('Please log in to save favorites');
      return false;
    }

    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    const isAlreadyFavorite = favorites.some((fav: FavoriteItem) => fav.id === item.id);
    if (isAlreadyFavorite) {
      toast.info('Already in favorites');
      return false;
    }

    const updatedFavorites = [...favorites, item];
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    toast.success('Added to favorites');
    return true;
  };

  const isFavorite = (itemId: string) => {
    if (!user) return false;
    
    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    return favorites.some((item: FavoriteItem) => item.id === itemId);
  };

  return { addToFavorites, isFavorite };
};