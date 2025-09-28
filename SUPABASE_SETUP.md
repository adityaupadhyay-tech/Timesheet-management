# Supabase Setup Guide

This guide will help you connect your timesheet management app to Supabase.

## Prerequisites

1. A Supabase account and project
2. Your Supabase project URL and anon key

## Setup Steps

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 3. Wrap Your App with SupabaseProvider

Update your main layout or app component to include the SupabaseProvider:

```jsx
import { SupabaseProvider } from '@/contexts/SupabaseContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
```

## Usage Examples

### Using the Supabase Context

```jsx
import { useSupabase } from '@/contexts/SupabaseContext'

function MyComponent() {
  const { user, signIn, signOut, select, insert } = useSupabase()

  // Check if user is authenticated
  if (user) {
    return <div>Welcome, {user.email}!</div>
  }

  return <div>Please sign in</div>
}
```

### Authentication

```jsx
// Sign up a new user
const { data, error } = await signUp('user@example.com', 'password', {
  full_name: 'John Doe'
})

// Sign in existing user
const { data, error } = await signIn('user@example.com', 'password')

// Sign out
await signOut()
```

### Database Operations

```jsx
// Select data
const { data, error } = await select('timesheets', '*', { user_id: user.id })

// Insert data
const { data, error } = await insert('timesheets', {
  user_id: user.id,
  date: '2024-01-01',
  hours: 8,
  description: 'Work on project'
})

// Update data
const { data, error } = await update('timesheets', timesheetId, {
  hours: 9,
  description: 'Updated work description'
})

// Delete data
const { data, error } = await delete('timesheets', timesheetId)
```

### Real-time Subscriptions

```jsx
useEffect(() => {
  const channel = subscribe('timesheets', (payload) => {
    console.log('Change received!', payload)
    // Handle real-time updates
  })

  return () => {
    unsubscribe(channel)
  }
}, [])
```

## Database Schema Suggestions

Here are some suggested tables for your timesheet management app:

### Users Table (handled by Supabase Auth)
- Supabase automatically handles user authentication
- You can extend user profiles with a `profiles` table

### Profiles Table
```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  department text,
  role text,
  hourly_rate decimal,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);
```

### Timesheets Table
```sql
create table timesheets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  hours decimal not null,
  description text,
  project_id uuid references projects(id),
  status text default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Projects Table
```sql
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  client text,
  status text default 'active' check (status in ('active', 'completed', 'on_hold')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Row Level Security (RLS)

Don't forget to enable RLS and create policies for your tables:

```sql
-- Enable RLS
alter table profiles enable row level security;
alter table timesheets enable row level security;
alter table projects enable row level security;

-- Example policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own timesheets" on timesheets for select using (auth.uid() = user_id);
create policy "Users can insert own timesheets" on timesheets for insert with check (auth.uid() = user_id);
```

## Files Created

- `.env.example` - Environment variables template
- `src/lib/supabase.js` - Supabase client configuration and helper functions
- `src/contexts/SupabaseContext.jsx` - React context for Supabase integration
- `SUPABASE_SETUP.md` - This setup guide

## Next Steps

1. Install the Supabase client library
2. Set up your environment variables
3. Create your database tables in Supabase
4. Wrap your app with the SupabaseProvider
5. Start using Supabase in your components!

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that your Supabase project is active
- Verify your RLS policies allow the operations you're trying to perform
- Check the browser console for any error messages
