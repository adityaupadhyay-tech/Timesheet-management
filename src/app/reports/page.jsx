'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ComingSoon from '@/components/ComingSoon'
import BarChartIcon from '@mui/icons-material/BarChart'

export default function ReportsPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <ComingSoon 
        title="Reports & Analytics"
        subtitle="Generate comprehensive reports and analytics for timesheets, projects, and team performance. This feature will include customizable dashboards, export functionality, and data visualization."
        icon={<BarChartIcon sx={{ fontSize: 80 }} />}
      />
    </Layout>
  )
}
