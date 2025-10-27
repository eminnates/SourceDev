'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Navbar'ın gözükmeyeceği sayfalar
  const hideNavbarRoutes = ['/login', '/register'];
  
  // Eğer current path hideNavbarRoutes'ta varsa, navbar'ı gösterme
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }
  
  return <Navbar />;
}

