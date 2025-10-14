-- =====================================================
-- FIX: Paycycle Not Pre-filling in Edit Employee Form
-- =====================================================
-- This updates the get_employee_details_for_edit function
-- to include the actual paycycle_id from the employee record
-- =====================================================

-- Drop and recreate the function with paycycle support
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
          'paycycle_id', e.paycycle_id,  -- ✅ NOW RETURNS ACTUAL PAYCYCLE
          'company_name', c.name,
          'job_title', jr.title,
          'location_name', l.name,
          'department_names', CASE 
            WHEN d.name IS NOT NULL THEN jsonb_build_array(d.name)
            ELSE '[]'::jsonb
          END,
          'paycycle_name', pc.name  -- ✅ NOW RETURNS PAYCYCLE NAME
        )
      )
    )
    FROM employees e
    LEFT JOIN companies c ON e.company_id = c.id
    LEFT JOIN job_roles jr ON e.job_role_id = jr.id
    LEFT JOIN locations l ON e.location_id = l.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN paycycles pc ON e.paycycle_id = pc.id  -- ✅ JOIN PAYCYCLES TABLE
    WHERE e.id = p_employee_id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the updated function
-- First, get an employee ID that has a paycycle:
SELECT id, first_name, last_name, email, company_id, paycycle_id 
FROM employees 
WHERE paycycle_id IS NOT NULL
LIMIT 1;

-- Then test with that ID (replace 'your-employee-uuid-here'):
-- SELECT get_employee_details_for_edit('your-employee-uuid-here');

-- Expected output should now show the paycycle_id and paycycle_name!

-- =====================================================
-- IMPORTANT NOTE
-- =====================================================
-- If the query above shows NO employees with paycycle_id,
-- it means your employees table doesn't have a paycycle_id column yet.
-- You need to add it first. See below:
-- =====================================================

-- OPTIONAL: Add paycycle_id column to employees table (if it doesn't exist)
-- Uncomment and run this if your employees table doesn't have paycycle_id:

/*
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS paycycle_id UUID REFERENCES paycycles(id) ON DELETE SET NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_paycycle_id ON employees(paycycle_id);

-- Add a comment
COMMENT ON COLUMN employees.paycycle_id IS 'The default paycycle for this employee';
*/

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this SQL:
-- 1. Go to your app: Administration → User Management
-- 2. Click Edit on any employee that has a paycycle assigned
-- 3. The Paycycle dropdown should now be pre-selected! ✅
-- =====================================================

