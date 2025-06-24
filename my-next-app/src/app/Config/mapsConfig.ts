// src/config/mapsConfig.ts
import { Libraries } from '@react-google-maps/api';

// Type for the map configuration
export interface MapConfig {
  googleMapsApiKey: string;
  libraries: Libraries;
  preventGoogleFontsLoading: boolean;
}

// API key with type safety
export const GOOGLE_MAPS_API_KEY: string = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Default configuration for Google Maps
export const defaultMapConfig: MapConfig = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geocoding'],
  preventGoogleFontsLoading: true,
};

// Map styling options (optional)
export const mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

// Default center coordinates
export const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};