'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import { UserRole } from '@/types'
import ScheduleIcon from '@mui/icons-material/Schedule'

export default function NewTimesheetPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin' as UserRole, // Using same role as dashboard for consistency
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Log Time Entry"
        subtitle="Create a new time entry with project assignment, task description, and duration tracking. This feature will include time tracking tools, project selection, and detailed entry forms."
        icon={<ScheduleIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
