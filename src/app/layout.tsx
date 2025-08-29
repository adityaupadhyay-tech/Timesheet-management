import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Timesheet Management System',
  description: 'A modern timesheet management application for tracking work hours and projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <div className="min-h-screen bg-background">
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </div>
      </body>
    </html>
  )
}
