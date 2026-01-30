import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast({
        title: "Missing Information",
        description: "Please enter either your email or phone number to track your order.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (email) {
        query = query.eq('customer_email', email.toLowerCase());
      } else if (phone) {
        query = query.eq('customer_phone', phone);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const orderData = data[0];
        setOrder({
          ...orderData,
          items: Array.isArray(orderData.items) ? orderData.items : []
        });
      } else {
        setOrder(null);
        toast({
          title: "Order Not Found",
          description: "No order found with the provided information. Please check your email or phone number.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      });
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

  const handleClose = () => {
    setEmail("");
    setPhone("");
    setOrder(null);
    setSearched(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Track Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!order && (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">OR</div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Track Order"
                )}
              </Button>
            </form>
          )}

          {order && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{order.id.slice(-8).toUpperCase()}</span>
                  <Badge className={getStatusColor(order.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Customer:</p>
                    <p className="text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total:</p>
                    <p className="text-muted-foreground">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Order Date:</p>
                    <p className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Updated:</p>
                    <p className="text-muted-foreground">
                      {new Date(order.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">Delivery Address:</p>
                  <p className="text-muted-foreground text-sm">{order.delivery_address}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.order_notes && (
                  <div>
                    <p className="font-medium">Order Notes:</p>
                    <p className="text-muted-foreground text-sm">{order.order_notes}</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => setOrder(null)} 
                  className="w-full"
                >
                  Track Another Order
                </Button>
              </CardContent>
            </Card>
          )}

          {searched && !order && !loading && (
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No order found with the provided information.</p>
                <p className="text-sm">Please check your email or phone number and try again.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSearched(false)} 
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}