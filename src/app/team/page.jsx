'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import PeopleIcon from '@mui/icons-material/People'

export default function TeamPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'manager',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Team Management"
        subtitle="Manage your team members, view their performance, and coordinate team activities. This feature will include team overview, member profiles, performance tracking, and team collaboration tools."
        icon={<PeopleIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
