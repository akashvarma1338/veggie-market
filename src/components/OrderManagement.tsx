import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Package, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  total_amount: number;
  items: any;
  status: string;
  order_notes: string | null;
  created_at: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    } else if (user && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user, isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Orders fetched:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading orders...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Order Management</h3>
        <div className="flex items-center gap-4">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            Total Orders: {orders.length}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Order #{order.id.slice(0, 8)}</h4>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Customer:</span> {order.customer_name}
                      <br />
                      <span className="font-medium">Email:</span> {order.customer_email}
                      {order.customer_phone && (
                        <>
                          <br />
                          <span className="font-medium">Phone:</span> {order.customer_phone}
                        </>
                      )}
                    </div>
                    
                    <div>
                      <span className="font-medium">Total:</span> ₹{order.total_amount}
                      <br />
                      <span className="font-medium">Items:</span> {Array.isArray(order.items) ? order.items.length : 0} item(s)
                      <br />
                      <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    
                    <div>
                      <span className="font-medium">Address:</span>
                      <br />
                      <span className="text-muted-foreground">{order.delivery_address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                        <DialogDescription>
                          Complete order information and status management
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Customer Information</h4>
                              <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                              <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                              {selectedOrder.customer_phone && (
                                <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                              )}
                              <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Order Information</h4>
                              <p><strong>Total:</strong> ₹{selectedOrder.total_amount}</p>
                              <p><strong>Status:</strong> {selectedOrder.status}</p>
                              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                              {selectedOrder.order_notes && (
                                <p><strong>Notes:</strong> {selectedOrder.order_notes}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Items Ordered</h4>
                            <div className="space-y-2">
                              {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                  <span>{item.name || 'Unknown Item'}</span>
                                  <span>{item.quantity || 0}kg × ₹{item.price || 0} = ₹{(item.quantity || 0) * (item.price || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Update Status</h4>
                            <Select
                              value={selectedOrder.status}
                              onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found. Orders will appear here when customers place them.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}