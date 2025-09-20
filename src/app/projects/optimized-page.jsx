'use client'

import { memo, lazy, Suspense } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import OptimizedIcon from '@/components/ui/OptimizedIcon'

// Lazy load heavy components
const ComingSoon = lazy(() => import('@/components/ComingSoon'))

const OptimizedProjectsPage = memo(function OptimizedProjectsPage() {
  return (
    
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto px-5 py-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="mt-2 text-gray-600">Create and manage projects, assign team members, and track project progress</p>
              </div>
              <div className="flex items-center gap-3">
                <OptimizedIcon name="assignment" className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5">
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span></div></div>
              }>
                <ComingSoon 
                  title="Project Management"
                  subtitle="Create and manage projects, assign team members, and track project progress. This feature will include project creation, task assignment, milestone tracking, and project analytics."
                  icon={<OptimizedIcon name="assignment" className="h-20 w-20 text-blue-600" />}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
})

export default OptimizedProjectsPage
