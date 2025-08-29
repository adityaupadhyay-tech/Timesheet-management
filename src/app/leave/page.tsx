'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import { UserRole } from '@/types'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'

export default function LeavePage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin' as UserRole, // Using same role as dashboard for consistency
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Leave Management"
        subtitle="Request time off, view your leave balance, and track approval status. This feature will include leave request forms, approval workflows, and calendar integration."
        icon={<BeachAccessIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
