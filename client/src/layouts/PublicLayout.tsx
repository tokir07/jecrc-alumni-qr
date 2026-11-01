import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFB]">
      <Navbar />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <Footer />
    </div>
  );
};
