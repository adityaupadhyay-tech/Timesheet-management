'use client'

import React from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Building from '@mui/icons-material/Business'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function CompanySetupPage() {
  const { user } = useSupabase()
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin',
  } : {
    name: 'Admin User',
    role: 'admin',
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Company Setup"
          subtitle="Setup company structure, locations, departments, and employees"
          icon={<Building />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'Company Setup' },
          ]}
        />

        <AdminDashboard />
      </div>
    </Layout>
  )
}


