# 🔧 Fix: Employee Edit - Show Existing Assignments

## ❌ Problem

When you click **Edit** on an employee in User Management, the form shows the employee's name and email, but the assignment fields (Company, Job Role, Location, Department) are **empty** instead of showing the current values.

## ✅ Solution

The database is missing two functions that the application needs. Run the SQL file to create them.

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the SQL Fix

1. Open the file: `FIX_EMPLOYEE_EDIT_ASSIGNMENT.sql`
2. **Copy all the SQL** (Ctrl+A, Ctrl+C)
3. **Paste** into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. ✅ You should see: "Success. No rows returned"

### Step 3: Verify It Works

Run these test queries in Supabase to verify:

```sql
-- Test 1: Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('get_all_employees_with_assignments', 'get_employee_details_for_edit');
-- Should return 2 rows
```

```sql
-- Test 2: Get an employee ID and test
SELECT id, first_name, last_name FROM employees LIMIT 1;
-- Copy the ID, then run:
SELECT get_employee_details_for_edit('paste-id-here');
-- Should return employee data with assignments
```

### Step 4: Test in Your App

1. Go to **Administration** → **User Management**
2. Click **Edit** on any employee
3. ✅ The form should now show:
   - Employee name ✓
   - Employee email ✓
   - Company (pre-selected) ✓
   - Job Role (pre-selected) ✓
   - Location (pre-selected) ✓
   - Department (pre-selected) ✓

---

## 📊 What the SQL Does

Creates two database functions:

### Function 1: `get_all_employees_with_assignments()`

- Returns all employees with their company assignments
- Used to populate the employee list table
- Shows company name, job role, department, location for each employee

### Function 2: `get_employee_details_for_edit()`

- Returns detailed data for a specific employee
- Used when you click Edit button
- Returns:
  - Basic info (name, email, phone)
  - Assignments (company ID, job role ID, location ID, department IDs)
  - Display names for dropdowns

---

## 🧪 Troubleshooting

### Issue: "Success. No rows returned" but edit still doesn't work

**Solution:**

1. Hard refresh your browser (Ctrl+Shift+R)
2. Check browser console for errors (F12 → Console tab)
3. Make sure you're testing with an employee that has data assigned

### Issue: Edit shows empty fields

**Solution:** The employee might not have assignments. To fix:

```sql
-- Assign data to a test employee
UPDATE employees
SET
  company_id = (SELECT id FROM companies LIMIT 1),
  job_role_id = (SELECT id FROM job_roles LIMIT 1),
  location_id = (SELECT id FROM locations LIMIT 1),
  department_id = (SELECT id FROM departments LIMIT 1)
WHERE email = 'your-test-employee@email.com';
```

### Issue: "Function already exists"

**Solution:** The SQL includes `DROP FUNCTION IF EXISTS`, so this shouldn't happen. If it does, just run the SQL again.

### Issue: Console shows "RPC error"

**Solution:**

1. Make sure you ran the SQL in the correct Supabase project
2. Check the function names match exactly
3. Verify your Supabase connection is working

---

## 📁 Files

- **`FIX_EMPLOYEE_EDIT_ASSIGNMENT.sql`** - The SQL to run in Supabase ⭐
- **`README_EMPLOYEE_EDIT_FIX.md`** - This file
- **`src/components/admin/EmployeeManagement.jsx`** - Uses these functions
- **`src/lib/adminHelpers.js`** - Calls the database functions

---

## ✅ Expected Result

**Before Fix:**

```
Click Edit → Form shows:
❌ Name: John Doe
❌ Email: john@example.com
❌ Company: [empty dropdown]
❌ Job Role: [empty dropdown]
❌ Location: [empty dropdown]
❌ Department: [empty dropdown]
```

**After Fix:**

```
Click Edit → Form shows:
✅ Name: John Doe
✅ Email: john@example.com
✅ Company: Acme Corporation [pre-selected]
✅ Job Role: Software Engineer [pre-selected]
✅ Location: Main Office [pre-selected]
✅ Department: Engineering [pre-selected]
```

---

## 🎯 Summary

1. **Open** `FIX_EMPLOYEE_EDIT_ASSIGNMENT.sql`
2. **Copy** all the SQL
3. **Run** in Supabase SQL Editor
4. **Test** by editing an employee
5. **Done!** ✨

---

**Need help?** Check the SQL file - it has detailed comments and test queries!
