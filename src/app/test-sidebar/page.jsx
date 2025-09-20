'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSidebarPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sidebar Test Page</h1>
          <p className="mt-2 text-sm text-gray-600">
            This page demonstrates the collapsible sidebar functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Sidebar Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Collapsible on desktop</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Mobile overlay</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Active page highlighting</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Role-based menu items</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Smooth animations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{currentUser.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="ml-2 font-medium">{currentUser.role}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{currentUser.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Desktop:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Click the hamburger icon in the sidebar to collapse/expand</li>
                  <li>When collapsed, only icons are visible</li>
                  <li>Hover over icons to see tooltips (if implemented)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Mobile:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Click the hamburger icon in the top bar to open sidebar</li>
                  <li>Click outside the sidebar or the X button to close</li>
                  <li>Sidebar appears as an overlay on mobile</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}