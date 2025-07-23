import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
       <Toaster
  toastOptions={{
    // 🔹 Base style for all toasts
    style: {
      background: '#000000', // black
      color: '#ffffff',      // white text
      border: '1px solid #2e2e2e', // subtle dark gray border
      padding: '10px 16px',
    },
    // ✅ Success toast style
    success: {
      duration: 3000,
      style: {
        background: '#0a0a0a', // deeper black for success
        color: '#ffffff',
        border: '1px solid #22c55e', // Tailwind green-500
      },
      iconTheme: {
        primary: '#22c55e',    // green
        secondary: '#000000',
      },
    },
    // ❌ Error toast style
    error: {
      duration: 3000,
      style: {
        background: '#1a1a1a', // very dark red or black
        color: '#ff4d4d',      // soft red text
        border: '1px solid #ff4d4d',
      },
      iconTheme: {
        primary: '#ff4d4d',    // red
        secondary: '#000000',
      },
    },
  }}
  position="top-right"
  reverseOrder={false}
/>


        {children}
    </AppLayoutTemplate>
);
