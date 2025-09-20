'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import PeopleIcon from '@mui/icons-material/People'

export default function UsersPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="User Management"
        subtitle="Manage user accounts, roles, and permissions. This feature will include user creation, role assignment, access control, and user activity monitoring."
        icon={<PeopleIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
