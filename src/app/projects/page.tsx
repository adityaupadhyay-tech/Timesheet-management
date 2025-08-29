'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import { UserRole } from '@/types'
import AssignmentIcon from '@mui/icons-material/Assignment'

export default function ProjectsPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin' as UserRole,
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Project Management"
        subtitle="Create and manage projects, assign team members, and track project progress. This feature will include project creation, task assignment, milestone tracking, and project analytics."
        icon={<AssignmentIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
