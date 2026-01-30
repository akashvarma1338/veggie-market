export interface CartItem {
  id: string;
  name: string;
  variety: string;
  price: number;
  image: string;
  quantity: number;
  farmer: {
    name: string;
    location: string;
  };
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}