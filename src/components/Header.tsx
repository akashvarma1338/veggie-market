import { Search, ShoppingCart, User, Menu, ArrowLeft, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useLocationHook } from "@/contexts/LocationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { LocationSelector } from "@/components/LocationSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const { signOut, profile, isAdmin, isFarmer } = useAuth();
  const { customerLocation, setCustomerLocation } = useLocationHook();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  const isDashboard = location.pathname === '/dashboard';
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const searchInput = form.querySelector('input') as HTMLInputElement;
    const searchTerm = searchInput?.value.trim() || '';

    // Broadcast search term to pages
    window.dispatchEvent(new CustomEvent('app:search', { detail: { term: searchTerm } }));

    if (searchTerm) {
      const productsSection = document.getElementById('featured-products');
      productsSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with back button for mobile dashboard */}
            <div className="flex items-center gap-2">
              {isDashboard && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}
              >
                <div className="w-8 h-8 bg-gradient-tropical rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-xl text-foreground">VeggieMarket</span>
              </div>
            </div>
            
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search vegetables and farmers (name, variety, location)" 
                  className="pl-10 pr-4"
                />
              </form>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Location selector */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLocationSelector(true)}
                className="flex items-center gap-1"
                aria-label="Set location"
              >
                <MapPin className="h-4 w-4" />
                {customerLocation ? (
                  <span className="max-w-32 truncate">{customerLocation.split(',')[0]}</span>
                ) : (
                  'Set Location'
                )}
              </Button>
              
              {/* Search button for mobile */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
              
              {/* Desktop user menu */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                title={`${profile?.full_name || profile?.email} (${isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'User'})`}
                className="hidden md:flex"
              >
                <User className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
                className="hidden md:flex"
              >
                Sign Out
              </Button>
              
              {/* Mobile menu */}
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setShowLocationSelector(true);
                    setIsMobileMenuOpen(false);
                  }}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Set Location
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      {showLocationSelector && (
        <LocationSelector
          currentLocation={customerLocation}
          onLocationSelect={setCustomerLocation}
          onClose={() => setShowLocationSelector(false)}
        />
      )}
    </>
  );
}