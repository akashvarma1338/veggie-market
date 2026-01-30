import React, { useEffect, useState } from "react";
import { ArrowRight, Leaf, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { FarmerCard } from "@/components/FarmerCard";
import { Header } from "@/components/Header";
import { CartSidebar } from "@/components/CartSidebar";
import { ContactForm } from "@/components/ContactForm";
import { TrackOrderModal } from "@/components/TrackOrderModal";
import { LocationSelector } from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/contexts/LocationContext";
import { isWithinDeliveryRange } from "@/utils/locationUtils";

import heroImage from "@/assets/hero-vegetables.jpg";
import tomatoesImage from "@/assets/tomatoes.jpg";
import leafyGreensImage from "@/assets/leafy-greens.jpg";
import bellPeppersImage from "@/assets/bell-peppers.jpg";
import farmerRajImage from "@/assets/farmer-raj.jpg";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const { customerLocation, setCustomerLocation } = useLocation();

  // Map product names to images
  const productImageMap: { [key: string]: string } = {
    "Premium Alphonso": tomatoesImage,
    "Sweet Kesar": leafyGreensImage,
    "Fresh Haden": bellPeppersImage
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get products and then separately get farmer info
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        // Get all unique farmer emails
        const farmerEmails = [...new Set(products?.map(p => p.farmer_email).filter(Boolean))] as string[];
        
        // Fetch farmer details
        const farmersData: { [key: string]: any } = {};
        if (farmerEmails.length > 0) {
          const { data: farmers } = await supabase
            .from('farmers')
            .select('*')
            .in('email', farmerEmails);
          
          farmers?.forEach(farmer => {
            farmersData[farmer.email] = farmer;
          });
        }

        // Transform database products to match ProductCard interface
        const transformedProducts = products?.map((product) => {
          const farmer = farmersData[product.farmer_email];
          // Use product location from farm location set during product creation
          const productLocation = (product.location || farmer?.location || '') as string;
          
          return {
            id: product.id,
            name: product.name,
            variety: product.name, // Using name as variety for now
            price: Number((product.price * (1 + (product.margin_percentage || 0) / 100)).toFixed(2)), // Calculate final price with margin
            image: product.image_url || tomatoesImage, // Use actual product image from database
            farmer: {
              name: farmer?.name || 'Verified Farmer',
              location: productLocation,
              rating: 4.8
            },
            farmerLocation: productLocation,
            inStock: product.stock > 0,
            organic: product.category === 'Premium' // Consider premium as organic
          };
        }) || [];

        setFeaturedProducts(transformedProducts);
        console.log('Loaded products:', transformedProducts.length, transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Show location prompt after products load if no location is set
  useEffect(() => {
    if (!loading && !customerLocation && featuredProducts.length > 0) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, customerLocation, featuredProducts.length]);

  // Listen for global search events from Header
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const term = (custom.detail?.term as string) || '';
      setSearchTerm(term);
    };
    window.addEventListener('app:search', handler as EventListener);
    return () => window.removeEventListener('app:search', handler as EventListener);
  }, []);

  const featuredFarmers = [
    {
      name: "Raj Patel",
      location: "Ratnagiri, Maharashtra",
      rating: 4.9,
      reviewCount: 156,
      image: farmerRajImage,
      specialties: ["Alphonso", "Kesar", "Totapuri"],
      deliveryDays: 2,
      verified: true
    }
  ];

  // Apply search and location filters
  const filteredProducts = featuredProducts.filter((product) => {
    // Apply search filter
    const matchesSearch = searchTerm
      ? [product.name, product.variety, product.farmer.name, product.farmer.location]
          .some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    // Apply location filter - show products from farmers within delivery range
    // If no customer location is set, show all products
    // If customer location is set, filter by delivery range
    const matchesLocation = !customerLocation || 
      isWithinDeliveryRange(product.farmerLocation, customerLocation);
    
    // Debug location filtering
    if (customerLocation) {
      console.log('Filtering for customer location:', customerLocation);
      console.log('Product farmer location:', product.farmerLocation);
      console.log('Location match result:', matchesLocation);
    }
    
    return matchesSearch && matchesLocation;
  });

  const filteredFarmers = searchTerm
    ? featuredFarmers.filter((f) =>
        [f.name, f.location, ...(f.specialties || [])]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : featuredFarmers;

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warm-cream to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Fresh Vegetables
                <span className="block text-primary">Direct from Farmers</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Experience the authentic taste of premium vegetables sourced directly from certified farmers across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-tropical hover:opacity-90 transition-opacity"
                  onClick={() => {
                    document.getElementById('featured-products')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => {
                  document.getElementById('featured-farmers')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Meet Our Farmers
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <img 
                src={heroImage} 
                alt="Fresh vegetables" 
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-warm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Farm Fresh</h3>
              <p className="text-muted-foreground">Harvested at perfect ripeness and delivered within 24-48 hours</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-tropical rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Quality Assured</h3>
              <p className="text-muted-foreground">Every vegetable is hand-picked and quality checked by our farmers</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick and careful delivery to preserve freshness and flavor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Vegetables</h2>
            <p className="text-muted-foreground">Discover our premium selection of vegetables from verified farmers</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-card rounded-xl p-6 animate-pulse">
                  <div className="bg-muted h-48 rounded-lg mb-4"></div>
                  <div className="bg-muted h-4 rounded mb-2"></div>
                  <div className="bg-muted h-4 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} highlightTerm={searchTerm} />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground">
                  {searchTerm ? `No results for "${searchTerm}"` : "No products available"}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section id="featured-farmers" className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Farmers</h2>
            <p className="text-muted-foreground">Supporting local farmers and bringing you the best vegetables</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFarmers.length > 0 ? (
              filteredFarmers.map((farmer, index) => (
                <FarmerCard key={index} {...farmer} highlightTerm={searchTerm} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No results for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you!</p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-brown text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-tropical rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-xl">VeggieMarket</span>
              </div>
              <p className="text-white/80">
                Connecting farmers with customers for the freshest vegetable experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">All Vegetables</button></li>
                <li><button onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Organic Only</button></li>
                <li><button onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">By Variety</button></li>
                <li><button onClick={() => document.getElementById('featured-farmers')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">By Location</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Farmers</h3>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={() => document.getElementById('featured-farmers')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Sell Your Vegetables</button></li>
                <li><button onClick={() => document.getElementById('featured-farmers')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Farmer Portal</button></li>
                <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Support</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => setIsTrackOrderModalOpen(true)} className="hover:text-white transition-colors">Track Order</button></li>
                <li><button onClick={() => alert('Returns policy: Contact us within 24 hours')} className="hover:text-white transition-colors">Returns</button></li>
                <li><button onClick={() => alert('FAQ: Contact us for any questions')} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 VeggieMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <TrackOrderModal 
        isOpen={isTrackOrderModalOpen} 
        onClose={() => setIsTrackOrderModalOpen(false)} 
      />
      
      {showLocationPrompt && (
        <LocationSelector
          currentLocation={customerLocation}
          onLocationSelect={(location) => {
            setCustomerLocation(location);
            setShowLocationPrompt(false);
          }}
          onClose={() => setShowLocationPrompt(false)}
        />
      )}
    </div>
  );
};

export default Index;
