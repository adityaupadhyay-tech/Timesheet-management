import { Poppins } from 'next/font/google'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { SupabaseProvider } from '@/contexts/SupabaseContext'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'Timesheet Management System',
  description: 'A modern timesheet management application for tracking work hours and projects',
}

/**
 * Optimized root layout - Only loads essential contexts globally
 * Other contexts (UserProvider, CompaniesProvider) are loaded per-page as needed
 * 
 * @typedef {Object} RootLayoutProps
 * @property {React.ReactNode} children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <div className="min-h-screen bg-background">
          <SupabaseProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </SupabaseProvider>
        </div>
      </body>
    </html>
  )
}

