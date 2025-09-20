import { Poppins } from 'next/font/google'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { UserProvider } from '@/contexts/UserContext'

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
 * @typedef {Object} RootLayoutProps
 * @property {React.ReactNode} children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <div className="min-h-screen bg-background">
          <UserProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </UserProvider>
        </div>
      </body>
    </html>
  )
}
