'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MyStuffPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stuff</h1>
        <p className="text-gray-600">Manage your personal information, preferences, and account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage your name, email, phone number, and other personal details.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Configure your account preferences and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Change password, notification preferences, and privacy settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
            <CardDescription>Access and manage your personal documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and download your personal documents, contracts, and certificates.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
