# Refactoring Guide - How to Apply Optimizations

## 🎯 Overview

This guide shows you exactly how to replace existing components with optimized versions that use custom hooks and utilities.

---

## 📦 Available Optimized Versions

### 1. **EmployeeManagement Component** (1,010 → 380 lines)

**Location:**

- Original: `src/components/admin/EmployeeManagement.jsx` (1,010 lines)
- Optimized: `src/components/admin/EmployeeManagement-optimized.jsx` (380 lines)

**Benefits:**

- ✅ Uses `useEmployeeData`, `useEmployeeFilters`, `useEmployeeForm` hooks
- ✅ Uses split components (`EmployeeTable`, `EmployeeFilters`, `EmployeePagination`)
- ✅ 62% smaller (630 lines saved)
- ✅ Better testability and maintainability

**To Apply:**

```bash
# Option 1: Backup and replace
mv src/components/admin/EmployeeManagement.jsx src/components/admin/EmployeeManagement-backup.jsx
mv src/components/admin/EmployeeManagement-optimized.jsx src/components/admin/EmployeeManagement.jsx

# Option 2: Just use the optimized version
# (Manually copy contents or import from -optimized file)
```

---

### 2. **External Links Page** (470 → 250 lines)

**Location:**

- Original: `src/app/administration/external-links/page.jsx` (470 lines)
- Optimized: `src/app/administration/external-links/page-optimized.jsx` (250 lines)

**Benefits:**

- ✅ Uses `useLinkManagement` hook
- ✅ Cleaner CRUD operations
- ✅ 47% smaller (220 lines saved)
- ✅ Better error handling

**To Apply:**

```bash
# Option 1: Backup and replace
mv src/app/administration/external-links/page.jsx src/app/administration/external-links/page-backup.jsx
mv src/app/administration/external-links/page-optimized.jsx src/app/administration/external-links/page.jsx

# Option 2: Compare and manually merge improvements
# (Review both files side-by-side)
```

---

## 🔧 How to Use Custom Hooks

### Employee Management Hooks

```jsx
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { useEmployeeFilters } from "@/hooks/useEmployeeFilters";
import { useEmployeeForm } from "@/hooks/useEmployeeForm";

function YourComponent() {
  // Data operations
  const {
    allEmployees,
    loading,
    loadEmployees,
    createEmployee,
    updateEmployee,
  } = useEmployeeData();

  // Filtering and pagination
  const {
    filteredEmployees,
    paginatedEmployees,
    companyFilter,
    setCompanyFilter,
    clearFilters,
  } = useEmployeeFilters(allEmployees);

  // Form management
  const { formData, setFormData, validateForm, resetForm } = useEmployeeForm();

  // Your component logic
}
```

### Link Management Hook

```jsx
import { useLinkManagement } from "@/hooks/useLinkManagement";

function LinksComponent() {
  const { links, loading, fetchLinks, saveLink, deleteLink } =
    useLinkManagement();

  // Your component logic
}
```

---

## 🛠️ How to Use Utilities

### Validation

```jsx
import { validateEmployeeForm, isValidEmail } from "@/utils/validation";

// Validate entire form
const errors = validateEmployeeForm(formData);
if (Object.keys(errors).length > 0) {
  // Show errors
}

// Validate individual fields
if (!isValidEmail(email)) {
  // Show error
}
```

### Formatting

```jsx
import {
  formatDate,
  formatDuration,
  getInitials,
  minutesToHours,
} from "@/utils/formatting";

// Format date
const displayDate = formatDate(new Date()); // "Oct 13, 2025"
const customDate = formatDate(new Date(), { month: "long", day: "numeric" }); // "October 13"

// Format duration
const timeStr = formatDuration(135); // "02:15"

// Get initials
const initials = getInitials("John Doe"); // "JD"

// Convert minutes to hours
const hours = minutesToHours(120); // "2.0"
```

### Filtering

```jsx
import { filterBySearch, paginate, sortBy } from "@/utils/filters";

// Search
const results = filterBySearch(employees, searchTerm, [
  "first_name",
  "last_name",
  "email",
]);

// Paginate
const { items, totalPages, startIndex, endIndex } = paginate(
  results,
  currentPage,
  25
);

// Sort
const sorted = sortBy(items, "last_name", "asc");
```

### Calculations

```jsx
import {
  calculateTotalHours,
  calculateWeeklyTotal,
  calculateOvertime,
  calculatePay,
  validateTimesheetHours,
} from "@/utils/calculations";

// Calculate totals
const totalHours = calculateTotalHours(entries);
const weeklyTotal = calculateWeeklyTotal(gridRows);

// Calculate overtime
const { regularHours, overtimeHours } = calculateOvertime(45); // 40 regular, 5 overtime

// Calculate pay
const { regularPay, overtimePay, totalPay } = calculatePay(45, 25); // $1,187.50 total

// Validate hours
const { isValid, message } = validateTimesheetHours(180); // false, exceeds 168
```

---

## 📋 Step-by-Step Refactoring

### Refactoring a Component (Example)

#### Before:

```jsx
// Large component with inline logic
export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company: "", role: "" });

  const fetchData = async () => {
    setLoading(true);
    // fetch logic
    setLoading(false);
  };

  const filteredData = data.filter((item) => {
    // complex filter logic
  });

  // 500 more lines...
}
```

#### After:

```jsx
// Clean component using hooks
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { useEmployeeFilters } from "@/hooks/useEmployeeFilters";
import EmployeeTable from "@/components/admin/employee-management/EmployeeTable";

export default function MyComponent() {
  const { allEmployees, loading } = useEmployeeData();
  const { filteredEmployees, paginatedEmployees } =
    useEmployeeFilters(allEmployees);

  return <EmployeeTable employees={paginatedEmployees} />;
}
```

---

## ✅ Testing Checklist

After applying optimizations, test:

### Functional Testing:

- [ ] Employee CRUD operations work
- [ ] External links CRUD operations work
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Forms validate properly
- [ ] Data saves correctly

### Performance Testing:

- [ ] Pages load faster
- [ ] Dynamic imports work (check Network tab)
- [ ] Loading states appear
- [ ] No console errors
- [ ] No hydration warnings

### User Experience:

- [ ] UI remains responsive
- [ ] No visual glitches
- [ ] Smooth transitions
- [ ] Error messages clear

---

## 🐛 Common Issues

### Issue: "Cannot find module"

**Solution:** Ensure all new files are in correct locations:

- Hooks in `src/hooks/`
- Utils in `src/utils/`
- Components in proper folders

### Issue: Component not updating

**Solution:** Check that:

- useEffect dependencies are correct
- State is managed properly
- Callbacks use useCallback

### Issue: Infinite loops

**Solution:**

- Add proper dependencies to useEffect
- Use useCallback for functions passed as deps
- Check that hooks don't trigger unnecessary re-renders

---

## 📊 Comparison: Before vs After

### EmployeeManagement Component

**Before:**

```
Lines: 1,010
State variables: 15
useEffect calls: 1
Helper functions: 12
Responsibilities: Everything (data, UI, forms, modals)
```

**After:**

```
Lines: 380 (62% smaller)
Hooks used: 3 custom hooks
Split components: 3
Responsibilities: UI orchestration only
Reusable: Yes (hooks can be used elsewhere)
```

---

## 🚀 Gradual Migration Strategy

### Phase 1: Use Alongside Current Code

Keep both versions and gradually migrate:

```jsx
// Keep old component
import EmployeeManagementOld from "@/components/admin/EmployeeManagement-old";

// Use new optimized version
import EmployeeManagement from "@/components/admin/EmployeeManagement-optimized";

// Toggle based on feature flag
const useOptimized = true;
const Component = useOptimized ? EmployeeManagement : EmployeeManagementOld;
```

### Phase 2: Test Thoroughly

- Run all CRUD operations
- Test edge cases
- Verify data integrity

### Phase 3: Full Migration

Once confident, remove old versions

---

## 📚 Additional Resources

- **QUICK_REFERENCE.md** - Quick patterns and commands
- **IMPLEMENTATION_GUIDE.md** - Detailed implementation steps
- **OPTIMIZATION_PROGRESS.md** - Current progress status

---

## ✅ Success Criteria

You'll know the refactoring is successful when:

1. ✅ All tests pass
2. ✅ No console errors
3. ✅ Smaller bundle sizes
4. ✅ Faster page loads
5. ✅ Code is more maintainable
6. ✅ Team can understand the new structure

---

**Ready to apply?** Start with one component, test thoroughly, then move to the next!

**Last Updated:** $(date)
