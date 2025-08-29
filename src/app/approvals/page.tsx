'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import { UserRole } from '@/types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function ApprovalsPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'manager' as UserRole,
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Approvals"
        subtitle="Review and approve timesheets, leave requests, and other pending items. This feature will include approval workflows, bulk actions, notification system, and approval history tracking."
        icon={<CheckCircleIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
