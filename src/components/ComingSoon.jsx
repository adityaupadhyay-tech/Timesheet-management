import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'



export default function ComingSoon({ 
  title = "Coming Soon", 
  subtitle = "This feature is currently under development and will be available soon.",
  icon
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="flex justify-center mb-4">
            <div className="text-6xl text-gray-400">
              {icon}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 leading-relaxed">{subtitle}</p>
        </CardContent>
      </Card>
    </div>
  )
}
