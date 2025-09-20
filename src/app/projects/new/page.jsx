'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import AddTaskIcon from '@mui/icons-material/AddTask'

export default function NewProjectPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Create New Project"
        subtitle="Set up a new project with team assignment, timeline, and objectives. This feature will include project templates, team member assignment, milestone planning, and project configuration."
        icon={<AddTaskIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
