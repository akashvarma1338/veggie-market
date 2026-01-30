import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  customerLocation: string;
  setCustomerLocation: (location: string) => void;
  isLocationRequired: boolean;
  setIsLocationRequired: (required: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [customerLocation, setCustomerLocationState] = useState<string>('');
  const [isLocationRequired, setIsLocationRequired] = useState(false);

  // Load location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('customer-location');
    if (savedLocation) {
      setCustomerLocationState(savedLocation);
    }
  }, []);

  const setCustomerLocation = (location: string) => {
    setCustomerLocationState(location);
    localStorage.setItem('customer-location', location);
  };

  return (
    <LocationContext.Provider value={{
      customerLocation,
      setCustomerLocation,
      isLocationRequired,
      setIsLocationRequired
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}