import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Upload, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LocationAutocomplete } from './LocationAutocomplete';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  margin_percentage: number;
  image_url: string | null;
  stock: number;
  is_available: boolean;
  category: string | null;
  location: string | null;
  farmer_id: string | null;
  farmer_email: string | null;
}

export function ProductManagement() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [farmerLocation, setFarmerLocation] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    margin_percentage: '',
    category: '',
    stock: '',
    is_available: true,
    location: ''
  });

  useEffect(() => {
    fetchProducts();
    if (profile?.role === 'farmer') {
      fetchFarmerLocation();
    }
  }, [profile]);

  const fetchFarmerLocation = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('location')
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching farmer location:', error);
        return;
      }

      if (data?.location) {
        setFarmerLocation(data.location);
        setFormData(prev => ({ ...prev, location: data.location }));
      }
    } catch (error) {
      console.error('Error fetching farmer location:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // If farmer, only show their products
      if (profile?.role === 'farmer' && user?.email) {
        query = query.eq('farmer_email', user.email);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = editingProduct?.image_url || null;
      
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) return;
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        margin_percentage: parseFloat(formData.margin_percentage) || 0,
        image_url: imageUrl,
        stock: parseInt(formData.stock),
        is_available: formData.is_available,
        category: formData.category || null,
        location: formData.location || null,
        ...(profile?.role === 'farmer' && user?.email && {
          farmer_email: user.email
        })
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product added successfully');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      margin_percentage: '',
      category: '',
      stock: '',
      is_available: true,
      location: farmerLocation
    });
    setEditingProduct(null);
    setShowAddDialog(false);
    setImageFile(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      margin_percentage: product.margin_percentage?.toString() || '0',
      category: product.category || '',
      stock: product.stock.toString(),
      is_available: product.is_available,
      location: product.location || farmerLocation
    });
    setShowAddDialog(true);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Management</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details' : 'Create a new product for your store'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.margin_percentage}
                    onChange={(e) => setFormData({ ...formData, margin_percentage: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Final: ₹{((parseFloat(formData.price) || 0) * (1 + (parseFloat(formData.margin_percentage) || 0) / 100)).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock (kg)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Organic">Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile?.role === 'farmer' && (
                <div className="space-y-2">
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    label="Farm Location"
                    placeholder="e.g., Ratnagiri, Maharashtra"
                    className={!formData.location ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Products will be visible to customers in this location
                  </p>
                  {!farmerLocation && (
                    <p className="text-xs text-destructive">
                      Please update your farmer profile with your farm location first
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="available">Available for sale</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={uploading || (profile?.role === 'farmer' && !formData.location)}
                >
                  {uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Add'} Product
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  {product.description && (
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex flex-col">
                      <span className="font-medium">₹{(product.price * (1 + (product.margin_percentage || 0) / 100)).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">Base: ₹{product.price} + {product.margin_percentage || 0}% margin</span>
                    </div>
                    <span className="text-sm">Stock: {product.stock}kg</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    {product.category && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No products found. Add your first product to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}