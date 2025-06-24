import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Waitless - Virtual Queue Management",
  description: "Manage your queues efficiently with Waitless",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientLayout geistSans={geistSans} geistMono={geistMono}>
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
              success: {
                duration: 3000,
                style: {
                  background: '#4aed88',
                  color: '#fff'
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ff4b4b',
                  color: '#fff'
                },
              }
            }}
          />
        </ClientLayout>
      </body>
    </html>
  );
}