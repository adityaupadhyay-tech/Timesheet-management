'use client'

import React from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Users from '@mui/icons-material/People'
import UserManagement from '@/components/admin/UserManagement'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function UserManagementPage() {
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
          title="User Management"
          subtitle="Manage user accounts, roles, and permissions"
          icon={<Users />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'User Management' },
          ]}
        />

        <UserManagement />
      </div>
    </Layout>
  )
}


