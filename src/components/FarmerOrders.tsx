import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, MapPin, Phone, Mail, Calendar, Clock, CheckCircle, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  order_notes?: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

export function FarmerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        return;
      }

      // Transform the data to ensure items is properly typed
      const transformedOrders = (data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : []
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'processing':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'shipped':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case 'delivered':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'cancelled':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Customer Orders</h2>
        <p className="text-muted-foreground">View orders requiring your products and delivery addresses</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </div>
                    
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{order.customer_phone}</p>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Delivery Address:</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Total Amount: ₹{Number(order.total_amount).toFixed(2)}</p>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                              <span>{item.name} x {item.quantity}</span>
                              <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full"
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
                
                {order.order_notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium">Special Instructions:</p>
                    <p className="text-sm text-muted-foreground mt-1">{order.order_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Order #{selectedOrder.id.slice(-8).toUpperCase()} Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </Badge>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Placed: {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                        </div>
                      </div>
                      {selectedOrder.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{selectedOrder.customer_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="text-sm">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <p className="text-lg font-bold">Total: ₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
                  </div>

                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Items ({selectedOrder.items.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground"> x {item.quantity}</span>
                            </div>
                            <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.order_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                  <div className="bg-muted/50 p-3 rounded">
                    <p className="text-sm">{selectedOrder.order_notes}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground border-t pt-4">
                <p>Last updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}