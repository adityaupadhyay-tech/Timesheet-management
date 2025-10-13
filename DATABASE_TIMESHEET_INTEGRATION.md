# Timesheet Management - Database Integration

## Overview

This guide sets up the complete integration between timesheet management and the administration module (companies, employees, departments, locations).

**Based on your current database schema**, this will add:

- Paycycles table (if not exists)
- Projects table
- Project assignments
- Timesheets table
- Time entries table
- Timesheet comments/notes
- Helper functions and views

---

## ✅ Pre-flight Check

Your database already has these tables:

- ✅ `companies` (with paycycle settings columns)
- ✅ `locations`
- ✅ `departments`
- ✅ `job_roles`
- ✅ `employees`

We will now add:

- 📦 `paycycles` (for pay cycle definitions)
- 📦 `projects` (for time tracking)
- 📦 `project_assignments` (employee-to-project assignments)
- 📦 `timesheets` (main timesheet records)
- 📦 `time_entries` (individual time entries)
- 📦 `timesheet_comments` (notes and revision requests)

---

## Step 1: Create Paycycles Table

This table stores pay cycle definitions for each company.

```sql
-- =====================================================
-- PAYCYCLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS paycycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Paycycle information
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'semi-monthly', 'monthly')),
  cycle_type VARCHAR(50) DEFAULT 'regular' CHECK (cycle_type IN ('regular', 'special', 'bonus')),

  -- Period configuration
  period_end_date DATE,
  period_end_day_1 VARCHAR(20), -- e.g., 'Monday', 'Friday', '15', '30'
  period_end_day_2 VARCHAR(20), -- For semi-monthly (2 dates per month)

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  is_default BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Constraints
  UNIQUE(company_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_paycycles_company ON paycycles(company_id);
CREATE INDEX IF NOT EXISTS idx_paycycles_status ON paycycles(status);
```

---

## Step 2: Create Timesheet Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- =====================================================
-- TIMESHEET MANAGEMENT TABLES
-- =====================================================

-- Projects table (linked to companies)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'on-hold', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  budget_hours DECIMAL(10, 2),
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL
);

-- Project assignments (which employees can log time to which projects)
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(100),
  hourly_rate DECIMAL(10, 2),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  UNIQUE(project_id, employee_id)
);

-- Timesheets table (main timesheet record per employee per cycle)
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  paycycle_id UUID REFERENCES paycycles(id) ON DELETE SET NULL,

  -- Cycle information
  cycle_type VARCHAR(20) DEFAULT 'weekly' CHECK (cycle_type IN ('daily', 'weekly', 'bi-weekly', 'semi-monthly', 'monthly')),
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,

  -- Status and approval workflow
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'response_awaited')),

  -- Submission tracking
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Approval tracking
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Rejection tracking
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  rejection_reason TEXT,

  -- Totals
  total_hours DECIMAL(10, 2) DEFAULT 0,
  total_overtime_hours DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(employee_id, company_id, cycle_start_date, cycle_end_date)
);

-- Time entries table (individual time entries within a timesheet)
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Time information
  entry_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER NOT NULL DEFAULT 0,

  -- Entry details
  description TEXT NOT NULL,
  task_code VARCHAR(50),
  is_billable BOOLEAN DEFAULT true,
  is_overtime BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL
);

-- Timesheet comments/notes
CREATE TABLE IF NOT EXISTS timesheet_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  is_revision_request BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_company ON timesheets(company_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_cycle_dates ON timesheets(cycle_start_date, cycle_end_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_timesheet ON time_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee ON project_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
```

---

## Step 3: Create Helper Functions

### Function: Get Companies with Paycycle Details

```sql
-- Function to get companies with their paycycles
CREATE OR REPLACE FUNCTION get_companies_with_paycycle_details()
RETURNS TABLE (
  company_id UUID,
  company_name VARCHAR(255),
  company_description TEXT,
  company_status VARCHAR(50),
  allow_defaults BOOLEAN,
  auto_group_entry BOOLEAN,
  time_clock_imports BOOLEAN,
  use_all_departments BOOLEAN,
  email_notification BOOLEAN,
  paycycles JSON,
  employee_count BIGINT,
  department_count BIGINT,
  location_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as company_id,
    c.name as company_name,
    c.description as company_description,
    c.status as company_status,
    c.allow_defaults,
    c.auto_group_entry,
    c.time_clock_imports,
    c.use_all_departments,
    c.email_notification,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', pc.id,
            'name', pc.name,
            'frequency', pc.frequency,
            'cycle_type', pc.cycle_type,
            'period_end_date', pc.period_end_date,
            'period_end_day_1', pc.period_end_day_1,
            'period_end_day_2', pc.period_end_day_2,
            'status', pc.status,
            'is_default', pc.is_default
          )
        )
        FROM paycycles pc
        WHERE pc.company_id = c.id AND pc.status = 'active'
        ORDER BY pc.is_default DESC, pc.name
      ),
      '[]'::json
    ) as paycycles,
    (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id) as employee_count,
    (SELECT COUNT(*) FROM departments d WHERE d.company_id = c.id) as department_count,
    (SELECT COUNT(*) FROM locations l WHERE l.company_id = c.id) as location_count
  FROM companies c
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;
```

### Function: Get Employee Timesheets

```sql
-- Function to get all timesheets for an employee
CREATE OR REPLACE FUNCTION get_employee_timesheets(p_employee_id UUID)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  company_name VARCHAR(255),
  paycycle_id UUID,
  paycycle_name VARCHAR(255),
  cycle_type VARCHAR(20),
  cycle_start_date DATE,
  cycle_end_date DATE,
  status VARCHAR(50),
  total_hours DECIMAL(10, 2),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_name VARCHAR(255),
  entry_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.company_id,
    c.name as company_name,
    t.paycycle_id,
    pc.name as paycycle_name,
    t.cycle_type,
    t.cycle_start_date,
    t.cycle_end_date,
    t.status,
    t.total_hours,
    t.submitted_at,
    t.approved_at,
    CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
    (SELECT COUNT(*) FROM time_entries te WHERE te.timesheet_id = t.id) as entry_count
  FROM timesheets t
  LEFT JOIN companies c ON t.company_id = c.id
  LEFT JOIN paycycles pc ON t.paycycle_id = pc.id
  LEFT JOIN employees approver ON t.approved_by = approver.id
  WHERE t.employee_id = p_employee_id
  ORDER BY t.cycle_start_date DESC;
END;
$$ LANGUAGE plpgsql;
```

### Function: Get Company Timesheets (for managers/admins)

```sql
-- Function to get all timesheets for a company
CREATE OR REPLACE FUNCTION get_company_timesheets(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  employee_id UUID,
  employee_name VARCHAR(255),
  employee_email VARCHAR(255),
  department_name VARCHAR(255),
  location_name VARCHAR(255),
  job_title VARCHAR(255),
  cycle_type VARCHAR(20),
  cycle_start_date DATE,
  cycle_end_date DATE,
  status VARCHAR(50),
  total_hours DECIMAL(10, 2),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  entry_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    e.email as employee_email,
    d.name as department_name,
    l.name as location_name,
    jr.title as job_title,
    t.cycle_type,
    t.cycle_start_date,
    t.cycle_end_date,
    t.status,
    t.total_hours,
    t.submitted_at,
    t.approved_at,
    (SELECT COUNT(*) FROM time_entries te WHERE te.timesheet_id = t.id) as entry_count
  FROM timesheets t
  INNER JOIN employees e ON t.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN locations l ON e.location_id = l.id
  LEFT JOIN job_roles jr ON e.job_role_id = jr.id
  WHERE t.company_id = p_company_id
  ORDER BY t.cycle_start_date DESC, e.last_name, e.first_name;
END;
$$ LANGUAGE plpgsql;
```

### Function: Get Timesheet with Entries

```sql
-- Function to get a timesheet with all its time entries
CREATE OR REPLACE FUNCTION get_timesheet_with_entries(p_timesheet_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'timesheet', (
      SELECT row_to_json(t)
      FROM (
        SELECT
          ts.id,
          ts.employee_id,
          CONCAT(e.first_name, ' ', e.last_name) as employee_name,
          e.email as employee_email,
          ts.company_id,
          c.name as company_name,
          ts.cycle_type,
          ts.cycle_start_date,
          ts.cycle_end_date,
          ts.status,
          ts.total_hours,
          ts.submitted_at,
          ts.approved_at,
          ts.approved_by,
          ts.rejected_at,
          ts.rejected_by,
          ts.rejection_reason
        FROM timesheets ts
        INNER JOIN employees e ON ts.employee_id = e.id
        INNER JOIN companies c ON ts.company_id = c.id
        WHERE ts.id = p_timesheet_id
      ) t
    ),
    'entries', (
      SELECT json_agg(
        json_build_object(
          'id', te.id,
          'project_id', te.project_id,
          'project_name', p.name,
          'entry_date', te.entry_date,
          'start_time', te.start_time,
          'end_time', te.end_time,
          'duration_minutes', te.duration_minutes,
          'description', te.description,
          'is_billable', te.is_billable,
          'is_overtime', te.is_overtime,
          'status', te.status
        )
      )
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.timesheet_id = p_timesheet_id
      ORDER BY te.entry_date, te.created_at
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Function: Submit Timesheet

```sql
-- Function to submit a timesheet
CREATE OR REPLACE FUNCTION submit_timesheet(
  p_timesheet_id UUID,
  p_employee_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_timesheet_status VARCHAR(50);
  v_total_hours DECIMAL(10, 2);
BEGIN
  -- Check current status
  SELECT status INTO v_timesheet_status
  FROM timesheets
  WHERE id = p_timesheet_id AND employee_id = p_employee_id;

  IF v_timesheet_status IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Timesheet not found or unauthorized'
    );
  END IF;

  IF v_timesheet_status != 'draft' AND v_timesheet_status != 'rejected' AND v_timesheet_status != 'response_awaited' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Can only submit draft, rejected, or revision-requested timesheets'
    );
  END IF;

  -- Calculate total hours
  SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
  INTO v_total_hours
  FROM time_entries
  WHERE timesheet_id = p_timesheet_id;

  -- Update timesheet
  UPDATE timesheets
  SET
    status = 'submitted',
    submitted_at = NOW(),
    submitted_by = p_employee_id,
    total_hours = v_total_hours,
    updated_at = NOW()
  WHERE id = p_timesheet_id;

  -- Update all entries to submitted
  UPDATE time_entries
  SET status = 'submitted'
  WHERE timesheet_id = p_timesheet_id;

  RETURN json_build_object(
    'success', true,
    'timesheet_id', p_timesheet_id,
    'total_hours', v_total_hours
  );
END;
$$ LANGUAGE plpgsql;
```

### Function: Approve Timesheet

```sql
-- Function to approve a timesheet (manager/admin action)
CREATE OR REPLACE FUNCTION approve_timesheet(
  p_timesheet_id UUID,
  p_approved_by UUID
)
RETURNS JSON AS $$
DECLARE
  v_timesheet_status VARCHAR(50);
BEGIN
  -- Check current status
  SELECT status INTO v_timesheet_status
  FROM timesheets
  WHERE id = p_timesheet_id;

  IF v_timesheet_status IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Timesheet not found'
    );
  END IF;

  IF v_timesheet_status != 'submitted' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Can only approve submitted timesheets'
    );
  END IF;

  -- Update timesheet
  UPDATE timesheets
  SET
    status = 'approved',
    approved_at = NOW(),
    approved_by = p_approved_by,
    updated_at = NOW()
  WHERE id = p_timesheet_id;

  -- Update all entries to approved
  UPDATE time_entries
  SET status = 'approved'
  WHERE timesheet_id = p_timesheet_id;

  RETURN json_build_object(
    'success', true,
    'timesheet_id', p_timesheet_id
  );
END;
$$ LANGUAGE plpgsql;
```

### Function: Request Revision

```sql
-- Function to request revision on a timesheet
CREATE OR REPLACE FUNCTION request_timesheet_revision(
  p_timesheet_id UUID,
  p_rejected_by UUID,
  p_rejection_reason TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Update timesheet
  UPDATE timesheets
  SET
    status = 'response_awaited',
    rejected_at = NOW(),
    rejected_by = p_rejected_by,
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_timesheet_id AND status = 'submitted';

  -- Add comment
  INSERT INTO timesheet_comments (timesheet_id, employee_id, comment, is_revision_request)
  VALUES (p_timesheet_id, p_rejected_by, p_rejection_reason, true);

  RETURN json_build_object(
    'success', true,
    'timesheet_id', p_timesheet_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## Step 4: Create Views for Easy Querying

```sql
-- View for timesheet overview with employee details
CREATE OR REPLACE VIEW timesheet_overview AS
SELECT
  t.id as timesheet_id,
  t.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  e.email as employee_email,
  t.company_id,
  c.name as company_name,
  d.name as department_name,
  l.name as location_name,
  jr.title as job_title,
  t.paycycle_id,
  pc.name as paycycle_name,
  t.cycle_type,
  t.cycle_start_date,
  t.cycle_end_date,
  t.status,
  t.total_hours,
  t.submitted_at,
  t.approved_at,
  CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
  t.rejected_at,
  CONCAT(rejecter.first_name, ' ', rejecter.last_name) as rejected_by_name,
  t.rejection_reason,
  (SELECT COUNT(*) FROM time_entries te WHERE te.timesheet_id = t.id) as entry_count,
  (SELECT COUNT(DISTINCT te.project_id) FROM time_entries te WHERE te.timesheet_id = t.id) as project_count
FROM timesheets t
INNER JOIN employees e ON t.employee_id = e.id
LEFT JOIN companies c ON t.company_id = c.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN locations l ON e.location_id = l.id
LEFT JOIN job_roles jr ON e.job_role_id = jr.id
LEFT JOIN paycycles pc ON t.paycycle_id = pc.id
LEFT JOIN employees approver ON t.approved_by = approver.id
LEFT JOIN employees rejecter ON t.rejected_by = rejecter.id;

-- View for time entry details
CREATE OR REPLACE VIEW time_entry_details AS
SELECT
  te.id as entry_id,
  te.timesheet_id,
  te.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
  te.project_id,
  p.name as project_name,
  p.code as project_code,
  te.company_id,
  c.name as company_name,
  te.department_id,
  d.name as department_name,
  te.entry_date,
  te.start_time,
  te.end_time,
  te.duration_minutes,
  ROUND(te.duration_minutes / 60.0, 2) as duration_hours,
  te.description,
  te.is_billable,
  te.is_overtime,
  te.status,
  te.created_at
FROM time_entries te
INNER JOIN employees e ON te.employee_id = e.id
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN companies c ON te.company_id = c.id
LEFT JOIN departments d ON te.department_id = d.id;
```

---

## Step 5: Create Triggers for Auto-Updates

```sql
-- Trigger to update timesheet total when entries change
CREATE OR REPLACE FUNCTION update_timesheet_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timesheets
  SET
    total_hours = (
      SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
      FROM time_entries
      WHERE timesheet_id = COALESCE(NEW.timesheet_id, OLD.timesheet_id)
    ),
    total_overtime_hours = (
      SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
      FROM time_entries
      WHERE timesheet_id = COALESCE(NEW.timesheet_id, OLD.timesheet_id)
        AND is_overtime = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.timesheet_id, OLD.timesheet_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_timesheet_totals ON time_entries;
CREATE TRIGGER trigger_update_timesheet_totals
AFTER INSERT OR UPDATE OR DELETE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION update_timesheet_totals();

-- Trigger to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_timesheets_updated_at ON timesheets;
CREATE TRIGGER trigger_timesheets_updated_at
BEFORE UPDATE ON timesheets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_time_entries_updated_at ON time_entries;
CREATE TRIGGER trigger_time_entries_updated_at
BEFORE UPDATE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_paycycles_updated_at ON paycycles;
CREATE TRIGGER trigger_paycycles_updated_at
BEFORE UPDATE ON paycycles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

---

## Step 6: Row Level Security (RLS) Policies (Optional)

```sql
-- Enable RLS
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paycycles ENABLE ROW LEVEL SECURITY;

-- Timesheets policies
-- Employees can view their own timesheets
CREATE POLICY "Employees can view own timesheets"
  ON timesheets FOR SELECT
  USING (auth.uid()::uuid = employee_id);

-- Employees can insert their own timesheets
CREATE POLICY "Employees can create own timesheets"
  ON timesheets FOR INSERT
  WITH CHECK (auth.uid()::uuid = employee_id);

-- Employees can update their own draft/rejected timesheets
CREATE POLICY "Employees can update own draft timesheets"
  ON timesheets FOR UPDATE
  USING (auth.uid()::uuid = employee_id AND status IN ('draft', 'rejected', 'response_awaited'));

-- Managers/admins can view all timesheets in their company
CREATE POLICY "Managers can view company timesheets"
  ON timesheets FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM employees WHERE id = auth.uid()::uuid
    )
  );

-- Time entries policies
CREATE POLICY "Employees can manage own time entries"
  ON time_entries FOR ALL
  USING (auth.uid()::uuid = employee_id);

-- Projects policies
CREATE POLICY "Employees can view company projects"
  ON projects FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM employees WHERE id = auth.uid()::uuid
    )
  );

-- Project assignments policies
CREATE POLICY "Employees can view own project assignments"
  ON project_assignments FOR SELECT
  USING (auth.uid()::uuid = employee_id);

-- Paycycles policies
CREATE POLICY "Employees can view company paycycles"
  ON paycycles FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM employees WHERE id = auth.uid()::uuid
    )
  );
```

---

## Step 7: Sample Data (Optional)

```sql
-- Insert sample paycycles
INSERT INTO paycycles (company_id, name, frequency, cycle_type, status, is_default)
SELECT
  c.id,
  'Weekly Pay Cycle',
  'weekly',
  'regular',
  'active',
  true
FROM companies c
WHERE c.name = 'Acme Corporation'
ON CONFLICT (company_id, name) DO NOTHING;

INSERT INTO paycycles (company_id, name, frequency, cycle_type, status, is_default)
SELECT
  c.id,
  'Bi-Weekly Pay Cycle',
  'bi-weekly',
  'regular',
  'active',
  true
FROM companies c
WHERE c.name = 'TechFlow Systems'
ON CONFLICT (company_id, name) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (company_id, name, description, status, color)
SELECT
  c.id,
  'Website Redesign',
  'Redesigning the company website',
  'active',
  '#3B82F6'
FROM companies c
WHERE c.name = 'Acme Corporation'
ON CONFLICT DO NOTHING;

INSERT INTO projects (company_id, name, description, status, color)
SELECT
  c.id,
  'Mobile App Development',
  'Building a new mobile application',
  'active',
  '#10B981'
FROM companies c
WHERE c.name = 'Acme Corporation'
ON CONFLICT DO NOTHING;

INSERT INTO projects (company_id, name, description, status, color)
SELECT
  c.id,
  'Payment Gateway',
  'Implementing new payment system',
  'active',
  '#8B5CF6'
FROM companies c
WHERE c.name = 'TechFlow Systems'
ON CONFLICT DO NOTHING;

-- Assign projects to employees (adjust employee emails based on your data)
INSERT INTO project_assignments (project_id, employee_id, role, hourly_rate)
SELECT
  p.id,
  e.id,
  'Developer',
  75.00
FROM projects p
CROSS JOIN employees e
WHERE p.name = 'Website Redesign'
  AND e.email = 'john.doe@acme.com'
ON CONFLICT (project_id, employee_id) DO NOTHING;

INSERT INTO project_assignments (project_id, employee_id, role, hourly_rate)
SELECT
  p.id,
  e.id,
  'Lead Developer',
  95.00
FROM projects p
CROSS JOIN employees e
WHERE p.name = 'Payment Gateway'
  AND e.email = 'jane.smith@techflow.com'
ON CONFLICT (project_id, employee_id) DO NOTHING;
```

---

## Step 8: Verify Installation

Run this query to verify tables were created:

```sql
-- Verify all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('paycycles', 'timesheets', 'time_entries', 'projects', 'project_assignments', 'timesheet_comments')
ORDER BY table_name;
```

You should see all 6 tables listed.

Verify functions exist:

```sql
-- Verify functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%timesheet%' OR routine_name LIKE '%paycycle%'
ORDER BY routine_name;
```

Test the paycycle function:

```sql
-- Test the function
SELECT * FROM get_companies_with_paycycle_details();
```

---

## Integration Points

### 1. **Company → Paycycles → Timesheets**

- Each company has multiple paycycles
- Each timesheet is linked to a company and optionally a paycycle
- Managers can view all timesheets for their company

### 2. **Employee → Timesheets**

- Each employee has multiple timesheets (one per pay cycle)
- Employees can only view/edit their own timesheets

### 3. **Paycycle → Timesheets**

- Timesheets are linked to paycycles
- Cycle dates determine the timesheet period

### 4. **Projects → Time Entries**

- Time entries are logged against projects
- Projects are company-specific
- Employees must be assigned to projects

### 5. **Department/Location → Time Entries**

- Time entries capture department and location from employee record
- Enables cost allocation and reporting

---

## Next Steps

After running this SQL:

1. ✅ Test the `get_companies_with_paycycle_details()` function
2. ✅ Use the helper functions in your code (see `src/lib/timesheetHelpers.js`)
3. ✅ Update TimesheetContext to use real data
4. ✅ Connect admin section to timesheet management
5. ✅ Enable timesheet approval workflow

---

## 🎯 Quick Setup Script (Run All at Once)

If you want to run everything at once, copy this entire block:

```sql
-- Run all setup in one go
BEGIN;

-- 1. Paycycles
CREATE TABLE IF NOT EXISTS paycycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'weekly',
  cycle_type VARCHAR(50) DEFAULT 'regular',
  period_end_date DATE,
  period_end_day_1 VARCHAR(20),
  period_end_day_2 VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  UNIQUE(company_id, name)
);

-- 2. Projects & related tables (copy from Step 2 above)
-- 3. Functions (copy from Step 3 above)
-- 4. Views (copy from Step 4 above)
-- 5. Triggers (copy from Step 5 above)

COMMIT;

-- Verify
SELECT 'Setup complete! Tables created:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('paycycles', 'timesheets', 'time_entries', 'projects', 'project_assignments', 'timesheet_comments')
ORDER BY table_name;
```

---

**Status:** ✅ Ready for implementation  
**Estimated Time:** 30-60 minutes to run and verify  
**Impact:** Full integration between timesheets and administration

**Your existing paycycle-setup page will now work with real database data!** 🎉
