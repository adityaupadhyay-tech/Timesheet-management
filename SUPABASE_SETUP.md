# Supabase Setup Guide

This guide will help you set up Supabase integration for the Timesheet Management System.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. This project cloned and dependencies installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "timesheet-management")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon public key** (under "Project API keys")

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Set Up Database Schema

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_roles table
CREATE TABLE job_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  job_role_id UUID REFERENCES job_roles(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to get companies with stats
CREATE OR REPLACE FUNCTION get_companies_with_stats()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  employee_count BIGINT,
  department_count BIGINT,
  location_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.status,
    COALESCE(emp_count.count, 0) as employee_count,
    COALESCE(dept_count.count, 0) as department_count,
    COALESCE(loc_count.count, 0) as location_count,
    c.created_at,
    c.updated_at
  FROM companies c
  LEFT JOIN (
    SELECT company_id, COUNT(*) as count
    FROM employees
    GROUP BY company_id
  ) emp_count ON c.id = emp_count.company_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as count
    FROM departments
    GROUP BY company_id
  ) dept_count ON c.id = dept_count.company_id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as count
    FROM locations
    GROUP BY company_id
  ) loc_count ON c.id = loc_count.company_id
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get all employees with detailed info
CREATE OR REPLACE FUNCTION get_all_employees_detailed()
RETURNS TABLE (
  id UUID,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  department_name VARCHAR(255),
  job_title VARCHAR(255),
  location_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    c.name as company_name,
    d.name as department_name,
    jr.title as job_title,
    l.name as location_name,
    e.created_at
  FROM employees e
  LEFT JOIN companies c ON e.company_id = c.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN job_roles jr ON e.job_role_id = jr.id
  LEFT JOIN locations l ON e.location_id = l.id
  ORDER BY e.last_name, e.first_name;
END;
$$ LANGUAGE plpgsql;
```

## Step 5: Insert Sample Data (Optional)

```sql
-- Insert sample companies
INSERT INTO companies (name, description, status) VALUES
('Acme Corporation', 'A software development company specializing in enterprise solutions', 'active'),
('TechFlow Systems', 'Leading provider of fintech solutions and payment processing', 'active'),
('Global Logistics Inc', 'International shipping and freight forwarding services', 'active');

-- Insert sample locations
INSERT INTO locations (company_id, name, address, city, state, postal_code) VALUES
((SELECT id FROM companies WHERE name = 'Acme Corporation'), 'SF Headquarters', '123 Market Street', 'San Francisco', 'CA', '94105'),
((SELECT id FROM companies WHERE name = 'TechFlow Systems'), 'Manhattan Office', '456 Broadway', 'New York', 'NY', '10012');

-- Insert sample departments
INSERT INTO departments (company_id, name, description) VALUES
((SELECT id FROM companies WHERE name = 'Acme Corporation'), 'Engineering', 'Software development and technical architecture'),
((SELECT id FROM companies WHERE name = 'TechFlow Systems'), 'Engineering', 'Software development and technical architecture'),
((SELECT id FROM companies WHERE name = 'TechFlow Systems'), 'Sales', 'Business development and client acquisition');

-- Insert sample job roles
INSERT INTO job_roles (company_id, department_id, title, description) VALUES
((SELECT id FROM companies WHERE name = 'Acme Corporation'), (SELECT id FROM departments WHERE name = 'Engineering' AND company_id = (SELECT id FROM companies WHERE name = 'Acme Corporation')), 'Software Engineer', 'Develops and maintains software applications'),
((SELECT id FROM companies WHERE name = 'TechFlow Systems'), (SELECT id FROM departments WHERE name = 'Engineering' AND company_id = (SELECT id FROM companies WHERE name = 'TechFlow Systems')), 'Senior Developer', 'Leads development projects and mentors junior developers');

-- Insert sample employees
INSERT INTO employees (company_id, department_id, job_role_id, location_id, first_name, last_name, email, phone) VALUES
((SELECT id FROM companies WHERE name = 'Acme Corporation'), 
 (SELECT id FROM departments WHERE name = 'Engineering' AND company_id = (SELECT id FROM companies WHERE name = 'Acme Corporation')),
 (SELECT id FROM job_roles WHERE title = 'Software Engineer'),
 (SELECT id FROM locations WHERE name = 'SF Headquarters'),
 'John', 'Doe', 'john.doe@acme.com', '+1-555-123-4567'),
((SELECT id FROM companies WHERE name = 'TechFlow Systems'),
 (SELECT id FROM departments WHERE name = 'Engineering' AND company_id = (SELECT id FROM companies WHERE name = 'TechFlow Systems')),
 (SELECT id FROM job_roles WHERE title = 'Senior Developer'),
 (SELECT id FROM locations WHERE name = 'Manhattan Office'),
 'Jane', 'Smith', 'jane.smith@techflow.com', '+1-555-987-6543');
```

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/administration` in your browser
3. You should see the companies and employees data loaded from Supabase

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Make sure `.env.local` exists and contains the correct values
   - Restart your development server after adding environment variables

2. **"Module not found: @supabase/supabase-js" error**
   - Run `npm install @supabase/supabase-js`

3. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check that your Supabase project is active

4. **No data showing**
   - Make sure you've run the database schema SQL
   - Check the browser console for any JavaScript errors
   - Verify the database functions were created successfully

## Security Notes

- Never commit `.env.local` to version control
- The anon key is safe to use in client-side code
- For production, consider setting up Row Level Security (RLS) policies
- Use environment variables for different environments (dev, staging, prod)

## Next Steps

Once your Supabase integration is working:

1. Set up Row Level Security policies for data protection
2. Configure authentication if needed
3. Add real-time subscriptions for live data updates
4. Set up database backups and monitoring
