-- =====================================================
-- FIX: Allow Assigning Paycycles to Employees
-- =====================================================
-- This updates the create/update employee functions
-- to properly save paycycle_id in employee_companies
-- =====================================================

-- =====================================================
-- UPDATE: create_employee_with_structured_assignments
-- =====================================================

DROP FUNCTION IF EXISTS create_employee_with_structured_assignments(VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB);

CREATE OR REPLACE FUNCTION create_employee_with_structured_assignments(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_assignments JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_employee_id UUID;
  v_assignment JSONB;
  v_company_id UUID;
  v_job_role_id UUID;
  v_location_id UUID;
  v_paycycle_id UUID;
  v_department_id UUID;
BEGIN
  -- 1. Create the employee
  INSERT INTO employees (first_name, last_name, email, phone)
  VALUES (p_first_name, p_last_name, p_email, p_phone)
  RETURNING id INTO v_employee_id;

  -- 2. Loop through assignments and create company associations
  FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
  LOOP
    v_company_id := (v_assignment->>'companyId')::UUID;
    v_job_role_id := (v_assignment->>'jobRoleId')::UUID;
    v_location_id := (v_assignment->>'locationId')::UUID;
    v_paycycle_id := (v_assignment->>'paycycleId')::UUID; -- ✅ GET PAYCYCLE

    -- Insert into employee_companies with paycycle_id
    INSERT INTO employee_companies (employee_id, company_id, job_role_id, paycycle_id)
    VALUES (v_employee_id, v_company_id, v_job_role_id, v_paycycle_id) -- ✅ SAVE PAYCYCLE
    ON CONFLICT (employee_id, company_id) 
    DO UPDATE SET 
      job_role_id = EXCLUDED.job_role_id,
      paycycle_id = EXCLUDED.paycycle_id; -- ✅ UPDATE PAYCYCLE

    -- Insert location if provided
    IF v_location_id IS NOT NULL THEN
      INSERT INTO employee_locations (employee_id, location_id)
      VALUES (v_employee_id, v_location_id)
      ON CONFLICT (employee_id, location_id) DO NOTHING;
    END IF;

    -- Insert departments
    FOR v_department_id IN 
      SELECT (jsonb_array_elements_text(v_assignment->'departmentIds'))::UUID
    LOOP
      IF v_department_id IS NOT NULL THEN
        INSERT INTO employee_departments (employee_id, department_id)
        VALUES (v_employee_id, v_department_id)
        ON CONFLICT (employee_id, department_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  -- Return the new employee
  RETURN jsonb_build_object(
    'id', v_employee_id,
    'first_name', p_first_name,
    'last_name', p_last_name,
    'email', p_email
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE: update_employee_with_structured_assignments
-- =====================================================

DROP FUNCTION IF EXISTS update_employee_with_structured_assignments(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB);

CREATE OR REPLACE FUNCTION update_employee_with_structured_assignments(
  p_employee_id UUID,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_assignments JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_assignment JSONB;
  v_company_id UUID;
  v_job_role_id UUID;
  v_location_id UUID;
  v_paycycle_id UUID;
  v_department_id UUID;
BEGIN
  -- 1. Update employee basic info
  UPDATE employees
  SET 
    first_name = p_first_name,
    last_name = p_last_name,
    email = p_email,
    phone = p_phone,
    updated_at = NOW()
  WHERE id = p_employee_id;

  -- 2. Clear existing assignments
  DELETE FROM employee_companies WHERE employee_id = p_employee_id;
  DELETE FROM employee_locations WHERE employee_id = p_employee_id;
  DELETE FROM employee_departments WHERE employee_id = p_employee_id;

  -- 3. Loop through new assignments
  FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
  LOOP
    v_company_id := (v_assignment->>'companyId')::UUID;
    v_job_role_id := (v_assignment->>'jobRoleId')::UUID;
    v_location_id := (v_assignment->>'locationId')::UUID;
    v_paycycle_id := (v_assignment->>'paycycleId')::UUID; -- ✅ GET PAYCYCLE

    -- Insert into employee_companies with paycycle_id
    INSERT INTO employee_companies (employee_id, company_id, job_role_id, paycycle_id)
    VALUES (p_employee_id, v_company_id, v_job_role_id, v_paycycle_id); -- ✅ SAVE PAYCYCLE

    -- Insert location if provided
    IF v_location_id IS NOT NULL THEN
      INSERT INTO employee_locations (employee_id, location_id)
      VALUES (p_employee_id, v_location_id)
      ON CONFLICT (employee_id, location_id) DO NOTHING;
    END IF;

    -- Insert departments
    FOR v_department_id IN 
      SELECT (jsonb_array_elements_text(v_assignment->'departmentIds'))::UUID
    LOOP
      IF v_department_id IS NOT NULL THEN
        INSERT INTO employee_departments (employee_id, department_id)
        VALUES (p_employee_id, v_department_id)
        ON CONFLICT (employee_id, department_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  -- Return updated employee
  RETURN jsonb_build_object(
    'id', p_employee_id,
    'first_name', p_first_name,
    'last_name', p_last_name,
    'email', p_email
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test: Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('create_employee_with_structured_assignments', 'update_employee_with_structured_assignments')
ORDER BY routine_name;

-- Expected: Should show both functions

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this SQL:
-- 1. Hard refresh your browser (Ctrl+Shift+R)
-- 2. Go to: Administration → User Management
-- 3. Click Edit on an employee
-- 4. Select a Paycycle from the dropdown
-- 5. Click Save
-- 6. ✅ The paycycle will now be saved!
-- 7. Click Edit again → Paycycle should be pre-selected!
-- =====================================================

