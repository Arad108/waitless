import React, { createContext, useContext, ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';

interface MapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapsContext = createContext<MapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

interface MapsProviderProps {
  children: ReactNode;
  googleMapsApiKey: string;
}

export const MapsProvider = ({ children, googleMapsApiKey }: MapsProviderProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    // Prevent multiple loads
    preventGoogleFontsLoading: true,
    // Only load the libraries you need
    libraries: ['places', 'geometry'],
  });

  return (
    <MapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapsContext.Provider>
  );
};

export const useMaps = () => {
  const context = useContext(MapsContext);
  if (context === undefined) {
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
};