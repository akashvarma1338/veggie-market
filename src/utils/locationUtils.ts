// Simple location matching utilities
export function calculateLocationDistance(location1: string, location2: string): number {
  if (!location1 || !location2) return 1000; // Default large distance
  
  const norm1 = normalizeLocation(location1);
  const norm2 = normalizeLocation(location2);
  
  // Exact match
  if (norm1 === norm2) return 0;
  
  // Extract city and state
  const [city1, state1] = extractCityState(location1);
  const [city2, state2] = extractCityState(location2);
  
  // Same city
  if (city1 === city2) return 10;
  
  // Same state
  if (state1 === state2) return 50;
  
  // Different states
  return 500;
}

export function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/[^a-z\s]/g, '');
}

export function extractCityState(location: string): [string, string] {
  const parts = location.split(',').map(part => part.trim().toLowerCase());
  const city = parts[0] || '';
  const state = parts[1] || '';
  return [city, state];
}

export function isWithinDeliveryRange(farmerLocation: string, customerLocation: string, maxDistance: number = 100): boolean {
  // If no customer location is selected, show all products
  if (!customerLocation) return true;
  
  // If product has no location set, don't show it (farmer must set location)
  if (!farmerLocation) return false;
  
  const distance = calculateLocationDistance(farmerLocation, customerLocation);
  console.log(`Distance between ${farmerLocation} and ${customerLocation}: ${distance}km`);
  return distance <= maxDistance;
}