import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, MessageCircle, Package, Heart, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserOrders } from '@/components/UserOrders';
import { UserFavorites } from '@/components/UserFavorites';
import { ProfileSettings } from '@/components/ProfileSettings';

export function UserDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'orders' | 'favorites' | 'settings'>('dashboard');

  if (currentView === 'orders') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold">My Orders</h2>
        </div>
        <UserOrders />
      </div>
    );
  }

  if (currentView === 'favorites') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold">My Favorites</h2>
        </div>
        <UserFavorites />
      </div>
    );
  }

  if (currentView === 'settings') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <ProfileSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Shop Vegetables
            </CardTitle>
            <CardDescription>
              Browse our fresh selection of premium vegetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-tropical hover:opacity-90"
              onClick={() => navigate('/')}
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Get in touch with our team for any queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Scroll to contact section on home page
                navigate('/');
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }, 100);
              }}
            >
              Send Message
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              My Orders
            </CardTitle>
            <CardDescription>
              Track your vegetable orders and delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentView('orders')}
            >
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Favorites
            </CardTitle>
            <CardDescription>
              Your saved vegetable varieties and farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentView('favorites')}
            >
              View Favorites
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your profile and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentView('settings')}
            >
              Manage Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Everything you need to get the freshest vegetables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-tropical hover:opacity-90"
              onClick={() => navigate('/')}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Browse Vegetables
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('featured-farmers')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }, 100);
              }}
            >
              Meet Our Farmers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}