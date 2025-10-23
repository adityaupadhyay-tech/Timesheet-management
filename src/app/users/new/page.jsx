'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export default function NewUserPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'Admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Add New User"
        subtitle="Create a new user account with role assignment and permissions. This feature will include user registration forms, role management, and account activation workflows."
        icon={<PersonAddIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
