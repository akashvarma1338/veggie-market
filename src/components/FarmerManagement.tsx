import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Farmer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  specialization?: string;
  experience_years?: number;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FarmerFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  experience_years: number;
  bio: string;
}

const initialFormData: FarmerFormData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  specialization: '',
  experience_years: 0,
  bio: ''
};

export function FarmerManagement() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching farmers:', error);
        toast.error('Failed to fetch farmers');
        return;
      }

      setFarmers(data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to fetch farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFarmer) {
        // Update existing farmer
        const { error } = await supabase
          .from('farmers')
          .update(formData)
          .eq('id', editingFarmer.id);

        if (error) {
          toast.error('Failed to update farmer');
          return;
        }

        toast.success('Farmer updated successfully');
      } else {
        // Create new farmer
        const { error } = await supabase
          .from('farmers')
          .insert([formData]);

        if (error) {
          toast.error('Failed to create farmer');
          return;
        }

        toast.success('Farmer created successfully');
      }

      setIsDialogOpen(false);
      setEditingFarmer(null);
      setFormData(initialFormData);
      fetchFarmers();
    } catch (error) {
      console.error('Error saving farmer:', error);
      toast.error('Failed to save farmer');
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      email: farmer.email || '',
      phone: farmer.phone || '',
      location: farmer.location || '',
      specialization: farmer.specialization || '',
      experience_years: farmer.experience_years || 0,
      bio: farmer.bio || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (farmerId: string) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .update({ is_active: false })
        .eq('id', farmerId);

      if (error) {
        toast.error('Failed to delete farmer');
        return;
      }

      toast.success('Farmer deleted successfully');
      fetchFarmers();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      toast.error('Failed to delete farmer');
    }
  };

  const handleInputChange = (field: keyof FarmerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading farmers...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Farmer Management</CardTitle>
          <CardDescription>Manage farmer profiles and information</CardDescription>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingFarmer(null);
                setFormData(initialFormData);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
                </DialogTitle>
                <DialogDescription>
                  {editingFarmer ? 'Update farmer information' : 'Enter details for the new farmer'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Farmer's full name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91-9876543210"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Brief description about the farmer"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingFarmer ? 'Update Farmer' : 'Add Farmer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {farmers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No farmers found. Add your first farmer to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={farmer.avatar_url || ''} alt={farmer.name} />
                      <AvatarFallback>
                        {farmer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{farmer.name}</h3>
                      {farmer.specialization && (
                        <Badge variant="secondary">{farmer.specialization}</Badge>
                      )}
                      {farmer.bio && (
                        <p className="text-sm text-muted-foreground">{farmer.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(farmer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(farmer.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {farmer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {farmer.location}
                    </div>
                  )}
                  {farmer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {farmer.phone}
                    </div>
                  )}
                  {farmer.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {farmer.email}
                    </div>
                  )}
                  {farmer.experience_years && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {farmer.experience_years} years exp.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}