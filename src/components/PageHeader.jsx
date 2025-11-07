'use client'

import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from '@mui/icons-material'

/**
 * @typedef {Object} PageHeaderProps
 * @property {string} title - The main page title
 * @property {string} [subtitle] - Optional subtitle or description
 * @property {string} [icon] - Optional icon component
 * @property {Array<{label: string, href?: string}>} [breadcrumbs] - Optional breadcrumb navigation
 */

const PageHeader = memo(function PageHeader({ title, subtitle, icon, breadcrumbs }) {
  return (
    <Card className="mb-8">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default PageHeader
