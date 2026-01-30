import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LocationAutocomplete } from './LocationAutocomplete';

interface FarmerProfile {
  id?: string;
  name: string;
  location: string;
  phone: string;
  bio: string;
  specialization: string;
  experience_years: number;
}

export function FarmerLocationSettings() {
  const { user, profile } = useAuth();
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({
    name: '',
    location: '',
    phone: '',
    bio: '',
    specialization: '',
    experience_years: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'farmer') {
      fetchFarmerProfile();
    }
  }, [user, profile]);

  const fetchFarmerProfile = async () => {
    try {
      setIsLoading(true);
      // First check if farmer profile exists in farmers table
      const { data: farmers, error: farmersError } = await supabase
        .from('farmers')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (farmersError && farmersError.code !== 'PGRST116') {
        throw farmersError;
      }

      if (farmers) {
        setFarmerProfile({
          id: farmers.id,
          name: farmers.name || '',
          location: farmers.location || '',
          phone: farmers.phone || '',
          bio: farmers.bio || '',
          specialization: farmers.specialization || '',
          experience_years: farmers.experience_years || 0
        });
      } else {
        // Initialize with profile data if no farmer record exists
        setFarmerProfile({
          name: profile?.full_name || '',
          location: '',
          phone: '',
          bio: '',
          specialization: '',
          experience_years: 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching farmer profile:', error);
      toast.error('Failed to load farmer profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.email) return;

    setIsUpdating(true);
    try {
      const farmerData = {
        name: farmerProfile.name,
        email: user.email,
        location: farmerProfile.location,
        phone: farmerProfile.phone,
        bio: farmerProfile.bio,
        specialization: farmerProfile.specialization,
        experience_years: farmerProfile.experience_years,
        is_active: true
      };

      if (farmerProfile.id) {
        // Update existing farmer profile
        const { error } = await supabase
          .from('farmers')
          .update(farmerData)
          .eq('id', farmerProfile.id);

        if (error) throw error;
      } else {
        // Create new farmer profile
        const { data, error } = await supabase
          .from('farmers')
          .insert([farmerData])
          .select()
          .single();

        if (error) throw error;
        setFarmerProfile(prev => ({ ...prev, id: data.id }));
      }

      toast.success('Farmer profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating farmer profile:', error);
      toast.error(error.message || 'Failed to update farmer profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">Loading farmer profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Farmer Location & Details
        </CardTitle>
        <CardDescription>
          Set your farm location and details to help customers find your products
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="farmer-name">Farm/Farmer Name</Label>
            <Input
              id="farmer-name"
              value={farmerProfile.name}
              onChange={(e) => setFarmerProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your farm or business name"
              disabled={!isEditing}
            />
          </div>

          <div>
            <LocationAutocomplete
              value={farmerProfile.location}
              onChange={(value) => setFarmerProfile(prev => ({ ...prev, location: value }))}
              label="Farm Location"
              placeholder="e.g., Ratnagiri, Maharashtra"
              required
              disabled={!isEditing}
              className={!farmerProfile.location ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This determines which customers can see your products. Be specific with city and state.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input
              id="phone"
              value={farmerProfile.phone}
              onChange={(e) => setFarmerProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g., +91-9876543210"
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={farmerProfile.specialization}
              onChange={(e) => setFarmerProfile(prev => ({ ...prev, specialization: e.target.value }))}
              placeholder="e.g., Organic Tomatoes, Leafy Greens"
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="experience">Experience (Years)</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              value={farmerProfile.experience_years}
              onChange={(e) => setFarmerProfile(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
              placeholder="Years of farming experience"
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="bio">About Your Farm</Label>
            <Textarea
              id="bio"
              value={farmerProfile.bio}
              onChange={(e) => setFarmerProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell customers about your farm, farming practices, and expertise"
              rows={3}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-tropical hover:opacity-90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                disabled={isUpdating || !farmerProfile.location}
                className="bg-gradient-tropical hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  fetchFarmerProfile(); // Reset to original values
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {!farmerProfile.location && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Location Required
            </p>
            <p className="text-sm text-muted-foreground">
              You must set your farm location for customers to see your products. Only customers in your delivery area will be able to view and purchase your vegetables.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}