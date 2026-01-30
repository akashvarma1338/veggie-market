import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// Comprehensive list of Indian cities and locations
const INDIAN_LOCATIONS = [
  // Maharashtra
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Nagpur, Maharashtra',
  'Nashik, Maharashtra',
  'Ratnagiri, Maharashtra',
  'Kolhapur, Maharashtra',
  'Sangli, Maharashtra',
  'Solapur, Maharashtra',
  'Aurangabad, Maharashtra',
  'Thane, Maharashtra',
  'Navi Mumbai, Maharashtra',
  'Alphonso Belt, Maharashtra',
  
  // Gujarat
  'Ahmedabad, Gujarat',
  'Surat, Gujarat',
  'Vadodara, Gujarat',
  'Rajkot, Gujarat',
  'Bhavnagar, Gujarat',
  'Jamnagar, Gujarat',
  'Junagadh, Gujarat',
  'Kesar Belt, Gujarat',
  
  // Karnataka
  'Bangalore, Karnataka',
  'Mysore, Karnataka',
  'Hubli, Karnataka',
  'Dharwad, Karnataka',
  'Belgaum, Karnataka',
  'Gulbarga, Karnataka',
  'Bijapur, Karnataka',
  'Shimoga, Karnataka',
  'Tumkur, Karnataka',
  'Davangere, Karnataka',
  
  // Tamil Nadu
  'Chennai, Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Madurai, Tamil Nadu',
  'Tiruchirappalli, Tamil Nadu',
  'Salem, Tamil Nadu',
  'Erode, Tamil Nadu',
  'Tirunelveli, Tamil Nadu',
  'Vellore, Tamil Nadu',
  'Thoothukudi, Tamil Nadu',
  'Dindigul, Tamil Nadu',
  
  // Andhra Pradesh & Telangana
  'Hyderabad, Telangana',
  'Vijayawada, Andhra Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Guntur, Andhra Pradesh',
  'Nellore, Andhra Pradesh',
  'Kurnool, Andhra Pradesh',
  'Rajahmundry, Andhra Pradesh',
  'Tirupati, Andhra Pradesh',
  'Warangal, Telangana',
  'Nizamabad, Telangana',
  
  // Kerala
  'Kochi, Kerala',
  'Thiruvananthapuram, Kerala',
  'Kozhikode, Kerala',
  'Thrissur, Kerala',
  'Kollam, Kerala',
  'Palakkad, Kerala',
  'Malappuram, Kerala',
  'Kannur, Kerala',
  'Kottayam, Kerala',
  'Alappuzha, Kerala',
  
  // West Bengal
  'Kolkata, West Bengal',
  'Howrah, West Bengal',
  'Durgapur, West Bengal',
  'Asansol, West Bengal',
  'Siliguri, West Bengal',
  'Bardhaman, West Bengal',
  'Malda, West Bengal',
  'Kharagpur, West Bengal',
  
  // Uttar Pradesh
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Agra, Uttar Pradesh',
  'Varanasi, Uttar Pradesh',
  'Meerut, Uttar Pradesh',
  'Allahabad, Uttar Pradesh',
  'Bareilly, Uttar Pradesh',
  'Moradabad, Uttar Pradesh',
  'Saharanpur, Uttar Pradesh',
  'Gorakhpur, Uttar Pradesh',
  'Vegetable Market, Uttar Pradesh',
  
  // Delhi & NCR
  'Delhi, Delhi',
  'New Delhi, Delhi',
  'Gurgaon, Haryana',
  'Noida, Uttar Pradesh',
  'Faridabad, Haryana',
  'Ghaziabad, Uttar Pradesh',
  'Greater Noida, Uttar Pradesh',
  
  // Rajasthan
  'Jaipur, Rajasthan',
  'Jodhpur, Rajasthan',
  'Udaipur, Rajasthan',
  'Kota, Rajasthan',
  'Bikaner, Rajasthan',
  'Ajmer, Rajasthan',
  'Bharatpur, Rajasthan',
  'Alwar, Rajasthan',
  
  // Madhya Pradesh
  'Bhopal, Madhya Pradesh',
  'Indore, Madhya Pradesh',
  'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Ujjain, Madhya Pradesh',
  'Sagar, Madhya Pradesh',
  'Dewas, Madhya Pradesh',
  'Satna, Madhya Pradesh',
  
  // Other major cities
  'Chandigarh, Chandigarh',
  'Bhubaneswar, Odisha',
  'Guwahati, Assam',
  'Dehradun, Uttarakhand',
  'Shimla, Himachal Pradesh',
  'Jammu, Jammu and Kashmir',
  'Srinagar, Jammu and Kashmir',
  'Panaji, Goa',
  'Imphal, Manipur',
  'Aizawl, Mizoram',
  'Shillong, Meghalaya',
  'Agartala, Tripura',
  'Kohima, Nagaland',
  'Itanagar, Arunachal Pradesh',
  'Gangtok, Sikkim'
];

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter city and state", 
  label,
  required = false,
  className = "",
  disabled = false,
  autoFocus = false
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [databaseLocations, setDatabaseLocations] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch locations from database
  useEffect(() => {
    const fetchDatabaseLocations = async () => {
      try {
        // Get locations from farmers table
        const { data: farmerLocations } = await supabase
          .from('farmers')
          .select('location')
          .not('location', 'is', null)
          .neq('location', '');

        // Get locations from products table  
        const { data: productLocations } = await supabase
          .from('products')
          .select('location')
          .not('location', 'is', null)
          .neq('location', '');

        // Combine and deduplicate locations
        const allDbLocations = [
          ...(farmerLocations?.map(f => f.location) || []),
          ...(productLocations?.map(p => p.location) || [])
        ];
        
        const uniqueDbLocations = [...new Set(allDbLocations)].filter(Boolean) as string[];
        setDatabaseLocations(uniqueDbLocations);
      } catch (error) {
        console.error('Error fetching database locations:', error);
      }
    };

    fetchDatabaseLocations();
  }, []);

  useEffect(() => {
    if (value) {
      const searchTerm = value.toLowerCase();
      
      // First prioritize database locations (locations where farmers/products exist)
      const dbMatches = databaseLocations.filter(location =>
        location.toLowerCase().includes(searchTerm)
      );
      
      // Then add static locations that don't already exist in db matches
      const staticMatches = INDIAN_LOCATIONS.filter(location =>
        location.toLowerCase().includes(searchTerm) &&
        !dbMatches.some(dbLoc => dbLoc.toLowerCase() === location.toLowerCase())
      );
      
      // Combine with database locations first (prioritized)
      const combined = [...dbMatches, ...staticMatches].slice(0, 8);
      setFilteredLocations(combined);
    } else {
      setFilteredLocations([]);
    }
  }, [value, databaseLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true); // Always show dropdown when typing
  };

  const handleLocationSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onChange(value.trim());
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className="pr-8"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && !disabled && value.trim() && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-[60] mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {/* Always show "Use custom location" option when typing */}
          {value.trim() && !filteredLocations.some(loc => loc.toLowerCase() === value.toLowerCase()) && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm transition-colors border-b border-border"
              onClick={() => handleLocationSelect(value.trim())}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">Use "{value.trim()}" as location</span>
              </div>
            </div>
          )}
          
          {/* Show filtered suggestions with database locations prioritized */}
          {filteredLocations.map((location, index) => {
            const isFromDatabase = databaseLocations.some(dbLoc => 
              dbLoc.toLowerCase() === location.toLowerCase()
            );
            
            return (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`h-3 w-3 ${isFromDatabase ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={isFromDatabase ? 'font-medium' : ''}>{location}</span>
                  {isFromDatabase && (
                    <span className="text-xs text-primary ml-auto">• Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {value && !filteredLocations.some(loc => loc.toLowerCase() === value.toLowerCase()) && (
        <p className="text-xs text-muted-foreground mt-1">
          Custom location: {value}
        </p>
      )}
    </div>
  );
}
