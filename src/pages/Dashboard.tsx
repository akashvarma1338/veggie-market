import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserDashboard } from '@/components/UserDashboard';
import { FarmerDashboard } from '@/components/FarmerDashboard';
import { Header } from '@/components/Header';
import { CartSidebar } from '@/components/CartSidebar';

export default function Dashboard() {
  const { profile, isAdmin, isFarmer } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSidebar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {profile?.full_name || profile?.email}!
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Admin Dashboard' : isFarmer ? 'Farmer Dashboard' : 'User Dashboard'}
          </p>
        </div>

        {isAdmin ? (
          <AdminDashboard />
        ) : isFarmer ? (
          <FarmerDashboard />
        ) : (
          <UserDashboard />
        )}
      </div>
    </div>
  );
}