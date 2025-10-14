-- =====================================================
-- FINAL FIX: Create and Update Employee Functions
-- =====================================================
-- Updates to properly save job_role_id and paycycle_id
-- in the employee_companies table (not employees table)
-- =====================================================

-- =====================================================
-- 1. DROP OLD VERSIONS
-- =====================================================

DROP FUNCTION IF EXISTS create_employee_with_structured_assignments(VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID, JSONB);
DROP FUNCTION IF EXISTS create_employee_with_structured_assignments(VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB);

-- =====================================================
-- 2. CREATE: create_employee_with_structured_assignments
-- =====================================================

CREATE OR REPLACE FUNCTION create_employee_with_structured_assignments(
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_assignments JSONB
)
RETURNS UUID AS $$
DECLARE
    new_employee_id UUID;
    assignment JSONB;
    dept_id_text TEXT;
BEGIN
    -- Create employee (NO job_role_id here - it goes in employee_companies)
    INSERT INTO public.employees (first_name, last_name, email, phone)
    VALUES (p_first_name, p_last_name, p_email, p_phone)
    RETURNING id INTO new_employee_id;

    -- Loop through assignments
    FOR assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        -- Insert into employee_companies with job_role_id and paycycle_id
        INSERT INTO public.employee_companies (
            employee_id, 
            company_id, 
            job_role_id,      -- ✅ ADD job_role_id
            paycycle_id       -- ✅ ADD paycycle_id
        )
        VALUES (
            new_employee_id, 
            (assignment->>'companyId')::UUID,
            (assignment->>'jobRoleId')::UUID,    -- ✅ SAVE job_role_id
            (assignment->>'paycycleId')::UUID    -- ✅ SAVE paycycle_id
        );

        -- Insert location if provided
        IF assignment->>'locationId' IS NOT NULL THEN
            INSERT INTO public.employee_locations (employee_id, location_id)
            VALUES (new_employee_id, (assignment->>'locationId')::UUID);
        END IF;

        -- Insert departments
        FOR dept_id_text IN SELECT * FROM jsonb_array_elements_text(assignment->'departmentIds')
        LOOP
            IF dept_id_text IS NOT NULL AND dept_id_text != '' THEN
                INSERT INTO public.employee_departments (employee_id, department_id)
                VALUES (new_employee_id, dept_id_text::UUID);
            END IF;
        END LOOP;
    END LOOP;

    RETURN new_employee_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. DROP OLD UPDATE FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS update_employee_with_structured_assignments(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID, JSONB);
DROP FUNCTION IF EXISTS update_employee_with_structured_assignments(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB);

-- =====================================================
-- 4. UPDATE: update_employee_with_structured_assignments
-- =====================================================

CREATE OR REPLACE FUNCTION update_employee_with_structured_assignments(
    p_employee_id UUID,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_assignments JSONB
)
RETURNS UUID AS $$
DECLARE
    assignment JSONB;
    dept_id_text TEXT;
BEGIN
    -- Update employee basic info (NO job_role_id)
    UPDATE public.employees
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        phone = p_phone,
        updated_at = NOW()
    WHERE id = p_employee_id;

    -- Clear existing assignments
    DELETE FROM public.employee_companies WHERE employee_id = p_employee_id;
    DELETE FROM public.employee_locations WHERE employee_id = p_employee_id;
    DELETE FROM public.employee_departments WHERE employee_id = p_employee_id;

    -- Loop through new assignments
    FOR assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        -- Insert into employee_companies with job_role_id and paycycle_id
        INSERT INTO public.employee_companies (
            employee_id, 
            company_id, 
            job_role_id,      -- ✅ ADD job_role_id
            paycycle_id       -- ✅ ADD paycycle_id
        )
        VALUES (
            p_employee_id, 
            (assignment->>'companyId')::UUID,
            (assignment->>'jobRoleId')::UUID,    -- ✅ SAVE job_role_id
            (assignment->>'paycycleId')::UUID    -- ✅ SAVE paycycle_id
        );

        -- Insert location if provided
        IF assignment->>'locationId' IS NOT NULL THEN
            INSERT INTO public.employee_locations (employee_id, location_id)
            VALUES (p_employee_id, (assignment->>'locationId')::UUID);
        END IF;

        -- Insert departments
        FOR dept_id_text IN SELECT * FROM jsonb_array_elements_text(assignment->'departmentIds')
        LOOP
            IF dept_id_text IS NOT NULL AND dept_id_text != '' THEN
                INSERT INTO public.employee_departments (employee_id, department_id)
                VALUES (p_employee_id, dept_id_text::UUID);
            END IF;
        END LOOP;
    END LOOP;

    RETURN p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Check functions were created
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'create_employee_with_structured_assignments',
  'update_employee_with_structured_assignments'
)
ORDER BY routine_name;

-- Expected: Should show both functions

-- =====================================================
-- 6. TEST IT!
-- =====================================================

/*
After running this SQL:

1. Hard refresh your browser (Ctrl+Shift+R)
2. Go to User Management
3. Click "Add New Employee" or "Edit" existing employee
4. Fill in the form and SELECT A PAYCYCLE
5. Click Save
6. ✅ Should save successfully!
7. Click Edit on that employee again
8. ✅ All fields including PAYCYCLE should be pre-selected!
*/

-- =====================================================
-- SUCCESS!
-- =====================================================

