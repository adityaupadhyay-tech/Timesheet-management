-- =====================================================
-- FIX: Employee Edit - Display Existing Assignments
-- =====================================================
-- This creates the missing database functions for
-- employee management.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Function 1: Get all employees with assignments (for employee list)
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_all_employees_with_assignments();

CREATE OR REPLACE FUNCTION get_all_employees_with_assignments()
RETURNS TABLE (
  id UUID,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  company_id UUID,
  company_name VARCHAR(255),
  department_id UUID,
  department_name VARCHAR(255),
  job_role_id UUID,
  job_title VARCHAR(255),
  location_id UUID,
  location_name VARCHAR(255),
  company_assignments JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.company_id,
    c.name as company_name,
    e.department_id,
    d.name as department_name,
    e.job_role_id,
    jr.title as job_title,
    e.location_id,
    l.name as location_name,
    json_build_array(
      json_build_object(
        'company_id', e.company_id,
        'company_name', c.name,
        'job_role_id', e.job_role_id,
        'job_title', jr.title,
        'location_id', e.location_id,
        'location_name', l.name,
        'department_id', e.department_id,
        'department_name', d.name
      )
    ) as company_assignments
  FROM employees e
  LEFT JOIN companies c ON e.company_id = c.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN job_roles jr ON e.job_role_id = jr.id
  LEFT JOIN locations l ON e.location_id = l.id
  ORDER BY e.last_name, e.first_name;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get employee details for editing (for edit form)
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_employee_details_for_edit(UUID);

CREATE OR REPLACE FUNCTION get_employee_details_for_edit(p_employee_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'id', e.id,
      'first_name', e.first_name,
      'last_name', e.last_name,
      'email', e.email,
      'phone', e.phone,
      'assignments', jsonb_build_array(
        jsonb_build_object(
          'company_id', e.company_id,
          'job_role_id', e.job_role_id,
          'location_id', e.location_id,
          'department_ids', CASE 
            WHEN e.department_id IS NOT NULL THEN jsonb_build_array(e.department_id)
            ELSE '[]'::jsonb
          END,
          'paycycle_id', NULL,
          'company_name', c.name,
          'job_title', jr.title,
          'location_name', l.name,
          'department_names', CASE 
            WHEN d.name IS NOT NULL THEN jsonb_build_array(d.name)
            ELSE '[]'::jsonb
          END,
          'paycycle_name', NULL
        )
      )
    )
    FROM employees e
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN job_roles jr ON e.job_role_id = jr.id
    LEFT JOIN locations l ON e.location_id = l.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = p_employee_id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION TESTS
-- =====================================================

-- Test 1: Verify functions were created
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_all_employees_with_assignments', 'get_employee_details_for_edit')
ORDER BY routine_name;
-- Expected: 2 rows showing both functions

-- Test 2: Get all employees (test function 1)
SELECT * FROM get_all_employees_with_assignments() LIMIT 3;
-- Expected: List of employees with their company assignments

-- Test 3: Get a specific employee for editing (test function 2)
-- First, get an employee ID:
SELECT id, first_name, last_name, email, company_id, job_role_id, location_id, department_id 
FROM employees 
WHERE company_id IS NOT NULL
LIMIT 1;

-- Then test with that ID (replace 'your-employee-uuid-here' with actual ID from above):
-- SELECT get_employee_details_for_edit('your-employee-uuid-here');

-- Expected output should look like:
-- {
--   "id": "...",
--   "first_name": "John",
--   "last_name": "Doe",
--   "email": "john@example.com",
--   "phone": "123-456-7890",
--   "assignments": [
--     {
--       "company_id": "...",
--       "company_name": "Acme Corp",
--       "job_role_id": "...",
--       "job_title": "Developer",
--       "location_id": "...",
--       "location_name": "Main Office",
--       "department_ids": ["..."],
--       "department_names": ["Engineering"],
--       "paycycle_id": null,
--       "paycycle_name": null
--     }
--   ]
-- }

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this SQL:
-- 1. Go to your app: Administration → User Management
-- 2. Click Edit on any employee
-- 3. The form should now show:
--    ✅ Employee name, email, phone
--    ✅ Company dropdown (pre-selected)
--    ✅ Job Role dropdown (pre-selected)
--    ✅ Location dropdown (pre-selected)
--    ✅ Department dropdown (pre-selected)
-- =====================================================

