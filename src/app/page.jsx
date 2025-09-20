export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Timesheet Management System</h1>
        <p className="text-muted-foreground mb-4">Welcome to the application</p>
        <div className="space-y-2">
          <a href="/login" className="block text-blue-600 hover:underline">Go to Login</a>
          <a href="/register" className="block text-blue-600 hover:underline">Go to Register</a>
          <a href="/dashboard" className="block text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
