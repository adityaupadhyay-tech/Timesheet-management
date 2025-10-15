'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Users from '@mui/icons-material/People'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useSupabase } from '@/contexts/SupabaseContext'

// Dynamically import EmployeeManagement for better performance
const EmployeeManagement = dynamic(
  () => import('@/components/admin/EmployeeManagement'),
  { 
    loading: () => <LoadingSpinner message="Loading Employee Management..." />,
    ssr: false 
  }
)

export default function UserManagementPage() {
  const { user } = useSupabase()
  const currentUser = useMemo(() => user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin',
  } : {
    name: 'Admin User',
    role: 'admin',
  }, [user])

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Employee Management"
          subtitle="Manage employee records, assignments, and organizational structure"
          icon={<Users />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'Employee Management' },
          ]}
        />

        <EmployeeManagement />
      </div>
    </Layout>
  )
}


