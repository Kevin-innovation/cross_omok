'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { LoginModal, SignupModal } from '@/components/AuthModals';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <Header />
      <main className="pt-14 pb-16">
        {children}
      </main>
      <BottomNavigation />
      <LoginModal />
      <SignupModal />
    </AuthProvider>
  );
}
