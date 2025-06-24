'use client';

import { MapsProvider } from './MapsProvider';
import { AuthProvider } from './AuthContext';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: React.ReactNode;
  geistSans: any;
  geistMono: any;
}

export function ClientLayout({ children, geistSans, geistMono }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <MapsProvider googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
              },
            }}
          />
        </div>
      </MapsProvider>
    </AuthProvider>
  );
}