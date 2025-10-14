-- =====================================================
-- FIX: Paycycle Not Pre-filling in Edit Employee Form
-- (For Multi-Company Assignment Schema)
-- =====================================================
-- This updates the get_employee_details_for_edit function
-- to include the actual paycycle_id from employee_companies
-- =====================================================

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
            'assignments', (
                SELECT COALESCE(jsonb_agg(t.assignment), '[]'::jsonb)
                FROM (
                    SELECT jsonb_build_object(
                        'companyId', ec.company_id,
                        'jobRoleId', ec.job_role_id,
                        'paycycleId', ec.paycycle_id,  -- ✅ ADD PAYCYCLE FROM employee_companies
                        'locationId', (
                            SELECT el.location_id
                            FROM public.employee_locations el
                            JOIN public.locations l ON el.location_id = l.id
                            WHERE el.employee_id = e.id AND l.company_id = ec.company_id
                            LIMIT 1
                        ),
                        'departmentIds', (
                            SELECT COALESCE(jsonb_agg(ed.department_id), '[]'::jsonb)
                            FROM public.employee_departments ed
                            JOIN public.departments d ON ed.department_id = d.id
                            WHERE ed.employee_id = e.id AND d.company_id = ec.company_id
                        )
                    ) AS assignment
                    FROM public.employee_companies ec
                    WHERE ec.employee_id = e.id
                ) t
            )
        )
        FROM public.employees e
        WHERE e.id = p_employee_id
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Step 1: Check if employee_companies table has paycycle_id column
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'employee_companies' AND column_name = 'paycycle_id';

-- Expected: Should show 'paycycle_id' column
-- If NOT found, you need to add it (see below)

-- Step 2: Test the function
-- Get an employee ID to test:
SELECT id, first_name, last_name 
FROM employees 
LIMIT 1;

-- Then test with that ID (replace 'your-employee-id-here'):
-- SELECT get_employee_details_for_edit('your-employee-id-here');

-- Expected output should include paycycleId in assignments!

-- =====================================================
-- ADD paycycle_id COLUMN (if needed)
-- =====================================================
-- ONLY run this if Step 1 above showed NO paycycle_id column:

/*
ALTER TABLE employee_companies 
ADD COLUMN IF NOT EXISTS paycycle_id UUID REFERENCES paycycles(id) ON DELETE SET NULL;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_employee_companies_paycycle_id ON employee_companies(paycycle_id);

-- Add a comment
COMMENT ON COLUMN employee_companies.paycycle_id IS 'The paycycle for this employee-company assignment';
*/

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this SQL:
-- 1. Hard refresh your browser (Ctrl+Shift+R)
-- 2. Go to: Administration → User Management
-- 3. Click Edit on any employee
-- 4. The Paycycle dropdown should now be pre-selected! ✅
-- =====================================================

