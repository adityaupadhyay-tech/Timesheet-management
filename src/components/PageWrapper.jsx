'use client'

import { memo, Suspense } from 'react'
import Layout from './Layout'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent } from '@/components/ui/card'

const DefaultFallback = () => (
  <Card>
    <CardContent className="p-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    </CardContent>
  </Card>
)

const PageWrapper = memo(function PageWrapper({ 
  children, 
  fallback = <DefaultFallback /> 
}) {
  const { user } = useUser()

  return (
    <Layout userRole={user.role} userName={user.name}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </Layout>
  )
})

export default PageWrapper
