# Timesheet Management Integration Guide

## 🎯 Overview

This guide shows you how to integrate the timesheet management module with companies, employees, and the administration section.

---

## 📊 Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│            ADMINISTRATION SECTION                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐        │
│  │Companies │  │Employees │  │ Paycycles  │        │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘        │
│       │             │               │                │
└───────┼─────────────┼───────────────┼────────────────┘
        │             │               │
        └─────┬───────┴───────┬───────┘
              │               │
        ┌─────▼───────────────▼────────────────────────┐
        │      TIMESHEET MANAGEMENT                     │
        │  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
        │  │Timesheets│  │Time Entries│  │ Projects │ │
        │  └──────────┘  └────────────┘  └──────────┘ │
        └───────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Integration

### Step 1: Run Database Setup

Run the SQL from `DATABASE_TIMESHEET_INTEGRATION.md` in your Supabase SQL Editor:

```bash
# Open your Supabase dashboard
# Go to SQL Editor
# Copy and paste the SQL from DATABASE_TIMESHEET_INTEGRATION.md
# Run the queries
```

This creates:

- ✅ `projects` table
- ✅ `project_assignments` table
- ✅ `timesheets` table
- ✅ `time_entries` table
- ✅ `timesheet_comments` table
- ✅ Helper functions
- ✅ Views for easy querying
- ✅ Triggers for auto-updates
- ✅ RLS policies for security

### Step 2: Use the Integration Hook

```jsx
import { useTimesheetIntegration } from "@/hooks/useTimesheetIntegration";
import { useSupabase } from "@/contexts/SupabaseContext";

function MyTimesheetPage() {
  const { user } = useSupabase();

  const {
    timesheets,
    currentTimesheet,
    timeEntries,
    projects,
    employeeContext,
    loading,

    // Operations
    loadCurrentTimesheet,
    submitTimesheet,
    approveTimesheet,
    requestRevision,
    addTimeEntry,
    updateEntry,
    removeEntry,

    // Bulk operations
    bulkApprove,
    bulkRequestRevision,
  } = useTimesheetIntegration(user?.id, user?.role);

  // Your component logic
}
```

---

## 📋 Integration Features

### 1. **Employee Context Integration**

Each timesheet is automatically linked to:

- ✅ Employee's company
- ✅ Employee's department
- ✅ Employee's location
- ✅ Employee's assigned paycycle

```jsx
const { employeeContext } = useTimesheetIntegration(userId);

// Access context
console.log(employeeContext.company); // { id, name, status }
console.log(employeeContext.department); // { id, name }
console.log(employeeContext.location); // { id, name }
console.log(employeeContext.paycycle); // { id, name, frequency, cycle_type }
```

### 2. **Project Assignment Integration**

Employees can only log time to assigned projects:

```jsx
const { projects } = useTimesheetIntegration(userId);

// Projects are filtered by:
// - Employee's company
// - Employee's project assignments
// - Project status (active only)
```

### 3. **Approval Workflow Integration**

Complete approval workflow with:

- Submit for approval
- Manager approval
- Request revisions
- Employee resubmission

```jsx
// Employee submits timesheet
const { success } = await submitTimesheet();

// Manager approves
await approveTimesheet(timesheetId);

// Manager requests revision
await requestRevision(timesheetId, "Please add more details");
```

### 4. **Company-Specific Timesheets**

Timesheets respect company boundaries:

- Each timesheet belongs to one company
- Employees with multiple companies have separate timesheets
- Managers only see their company's timesheets

### 5. **Paycycle Integration**

Timesheets align with paycycles:

- Cycle type (weekly, bi-weekly, monthly, etc.)
- Automatic period calculation
- Cycle-based filtering

---

## 🔧 Implementation Examples

### Example 1: Employee Timesheet Page

```jsx
"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { useTimesheetIntegration } from "@/hooks/useTimesheetIntegration";
import TimeEntryGrid from "@/components/timesheet/TimeEntryGrid";
import TimesheetSummary from "@/components/timesheet/TimesheetSummary";

export default function EmployeeTimesheetPage() {
  const { user } = useSupabase();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    currentTimesheet,
    timeEntries,
    projects,
    employeeContext,
    loading,
    loadCurrentTimesheet,
    submitTimesheet,
    addTimeEntry,
    updateEntry,
    removeEntry,
  } = useTimesheetIntegration(user?.id, "employee");

  // Load timesheet for current cycle
  useEffect(() => {
    if (employeeContext?.paycycle) {
      const cycleType = employeeContext.paycycle.cycle_type || "weekly";
      // Calculate cycle dates based on selected date
      // Then load timesheet
      loadCurrentTimesheet(cycleStart, cycleEnd, cycleType);
    }
  }, [selectedDate, employeeContext]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <TimesheetSummary
        timesheet={currentTimesheet}
        entries={timeEntries}
        company={employeeContext?.company}
      />

      <TimeEntryGrid
        projects={projects}
        entries={timeEntries}
        onSave={addTimeEntry}
        onUpdate={updateEntry}
        onDelete={removeEntry}
        onSubmitTimesheet={submitTimesheet}
        timesheet={currentTimesheet}
        selectedCompany={employeeContext?.company}
      />
    </div>
  );
}
```

### Example 2: Manager Approval Page

```jsx
"use client";

import { useSupabase } from "@/contexts/SupabaseContext";
import { useTimesheetIntegration } from "@/hooks/useTimesheetIntegration";
import { useState } from "react";

export default function TimesheetApprovalPage() {
  const { user } = useSupabase();
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);

  const {
    timesheets,
    loading,
    approveTimesheet,
    requestRevision,
    bulkApprove,
    bulkRequestRevision,
  } = useTimesheetIntegration(user?.id, "manager");

  // Filter submitted timesheets
  const pendingTimesheets = timesheets.filter((t) => t.status === "submitted");

  const handleBulkApprove = async () => {
    const result = await bulkApprove(selectedTimesheets);
    if (result.success) {
      alert(`Approved ${result.data.successful} timesheets`);
      setSelectedTimesheets([]);
    }
  };

  const handleBulkRequestRevision = async (reason) => {
    const result = await bulkRequestRevision(selectedTimesheets, reason);
    if (result.success) {
      alert(`Requested revisions for ${result.data.successful} timesheets`);
      setSelectedTimesheets([]);
    }
  };

  return (
    <div>
      <h1>Pending Timesheet Approvals ({pendingTimesheets.length})</h1>

      {/* Display timesheets with selection */}
      {/* Add bulk action buttons */}

      <button onClick={handleBulkApprove}>
        Approve Selected ({selectedTimesheets.length})
      </button>
    </div>
  );
}
```

### Example 3: Company Timesheet Dashboard

```jsx
"use client";

import { useTimesheetIntegration } from "@/hooks/useTimesheetIntegration";
import { useSupabase } from "@/contexts/SupabaseContext";

export default function CompanyTimesheetDashboard() {
  const { user } = useSupabase();

  const { timesheets, employeeContext, loading } = useTimesheetIntegration(
    user?.id,
    "admin"
  );

  // Calculate stats
  const stats = {
    totalTimesheets: timesheets.length,
    submitted: timesheets.filter((t) => t.status === "submitted").length,
    approved: timesheets.filter((t) => t.status === "approved").length,
    pending: timesheets.filter((t) => t.status === "response_awaited").length,
    totalHours: timesheets.reduce((sum, t) => sum + (t.total_hours || 0), 0),
  };

  return (
    <div>
      <h1>Company Timesheets - {employeeContext?.company?.name}</h1>

      <div className="grid grid-cols-4 gap-4">
        <div>Total: {stats.totalTimesheets}</div>
        <div>Submitted: {stats.submitted}</div>
        <div>Approved: {stats.approved}</div>
        <div>Total Hours: {stats.totalHours}h</div>
      </div>

      {/* List all company timesheets */}
    </div>
  );
}
```

---

## 🔗 Key Integration Points

### 1. **Companies → Timesheets**

```javascript
// Each timesheet is linked to a company
timesheet.company_id → companies.id

// Managers see all company timesheets
const { timesheets } = useTimesheetIntegration(managerId, 'manager');
// Returns all timesheets for manager's company
```

### 2. **Employees → Timesheets**

```javascript
// Each employee has timesheets for each pay cycle
timesheet.employee_id → employees.id

// Get employee timesheets
const { timesheets } = useTimesheetIntegration(employeeId, 'employee');
// Returns only that employee's timesheets
```

### 3. **Paycycles → Timesheets**

```javascript
// Timesheets are linked to paycycles
timesheet.paycycle_id → paycycles.id

// Cycle determines:
// - Start and end dates
// - Frequency (weekly, bi-weekly, etc.)
// - Approval deadline
```

### 4. **Projects → Time Entries**

```javascript
// Time entries are logged against projects
time_entry.project_id → projects.id

// Projects are company-specific
project.company_id → companies.id

// Employees must be assigned to projects
project_assignments (project_id, employee_id)
```

### 5. **Departments → Time Entries**

```javascript
// Time entries capture department for cost allocation
time_entry.department_id → departments.id

// Enables reporting by department
```

---

## 📦 Available Helper Functions

### Timesheet Operations:

```javascript
import {
  getEmployeeTimesheets,
  getCompanyTimesheets,
  getTimesheetWithEntries,
  getOrCreateCurrentTimesheet,
  submitTimesheet,
  approveTimesheet,
  requestTimesheetRevision,
} from "@/lib/timesheetHelpers";
```

### Project Operations:

```javascript
import {
  getCompanyProjects,
  getEmployeeProjects,
  createProject,
  assignProjectToEmployee,
} from "@/lib/timesheetHelpers";
```

### Bulk Operations:

```javascript
import {
  bulkApproveTimesheets,
  bulkRequestRevisions,
} from "@/lib/timesheetHelpers";
```

### Reporting:

```javascript
import {
  getCompanyTimesheetStats,
  getProjectHoursSummary,
  getEmployeeHoursByDepartment,
  getPendingApprovalsForManager,
  getTimesheetDashboardSummary,
} from "@/lib/timesheetHelpers";
```

---

## 🔄 Data Flow

### Employee Time Entry Flow:

```
1. Employee selects company
2. System loads employee's paycycle
3. System loads assigned projects
4. Employee creates time entries
5. System saves to current timesheet
6. Employee submits timesheet
7. Timesheet goes to manager for approval
```

### Manager Approval Flow:

```
1. Manager logs in
2. System loads company timesheets
3. Manager sees submitted timesheets
4. Manager reviews time entries
5. Manager approves or requests revision
6. Employee gets notification
```

### Administration Integration:

```
1. Admin manages companies
2. Admin creates employees
3. Admin assigns employees to companies
4. Admin sets up paycycles
5. Admin creates projects
6. Admin assigns projects to employees
7. Timesheets automatically use this structure
```

---

## ✅ Checklist for Full Integration

### Database Setup:

- [ ] Run timesheet tables SQL
- [ ] Run helper functions SQL
- [ ] Run views SQL
- [ ] Run triggers SQL
- [ ] Run RLS policies SQL
- [ ] Insert sample data (optional)

### Code Integration:

- [ ] Add `timesheetHelpers.js` to `src/lib/`
- [ ] Add `useTimesheetIntegration.js` to `src/hooks/`
- [ ] Update timesheet pages to use integration hook
- [ ] Connect approval workflow
- [ ] Test end-to-end flow

### Testing:

- [ ] Create employee with company assignment
- [ ] Create projects for company
- [ ] Assign projects to employee
- [ ] Create timesheet entries
- [ ] Submit timesheet
- [ ] Approve as manager
- [ ] Verify data consistency

---

## 🎯 Benefits of Integration

### For Employees:

- ✅ Automatic company/department association
- ✅ Only see relevant projects
- ✅ Paycycle-aligned timesheets
- ✅ Clear approval workflow

### For Managers:

- ✅ See all company timesheets
- ✅ Filter by department/location
- ✅ Bulk approval operations
- ✅ Request revisions with feedback

### For Admins:

- ✅ Company-wide reporting
- ✅ Hours by department/project
- ✅ Cost allocation
- ✅ Compliance tracking

### For Business:

- ✅ Accurate payroll data
- ✅ Project cost tracking
- ✅ Resource utilization
- ✅ Audit trail

---

## 📊 Example Use Cases

### Use Case 1: Employee Time Entry

```
Employee: John Doe
Company: Acme Corporation
Department: Engineering
Paycycle: Weekly (Monday-Friday)

Flow:
1. John opens timesheet page
2. System loads his company (Acme Corporation)
3. System loads his paycycle (Weekly)
4. System loads his assigned projects (Website Redesign, Mobile App)
5. John enters time: 8 hours on Website Redesign (Monday)
6. System saves to time_entries table
7. System links to John's timesheet for current week
8. John submits timesheet
9. Manager receives notification
```

### Use Case 2: Manager Approval

```
Manager: Sarah Manager
Company: Acme Corporation
Team: 5 engineers

Flow:
1. Sarah opens approvals page
2. System loads all Acme Corporation submitted timesheets
3. Sarah sees 3 pending approvals
4. Sarah reviews John's timesheet
5. Sarah approves John's timesheet
6. System updates timesheet status to 'approved'
7. Payroll can now process approved timesheets
```

### Use Case 3: Cross-Department Reporting

```
Admin: HR Admin
Companies: Multiple
Departments: All

Flow:
1. Admin opens reports page
2. Selects company: Acme Corporation
3. Selects date range: Last month
4. System shows:
   - Total hours by department
   - Hours by project
   - Employee utilization
   - Cost allocation
```

---

## 🔧 Advanced Integration

### Multi-Company Employees

For employees assigned to multiple companies:

```javascript
// Get all companies for employee
const { data: assignments } = await supabase
  .from("employee_companies")
  .select(
    `
    company_id,
    paycycle_id,
    companies (id, name),
    paycycles (id, name, frequency)
  `
  )
  .eq("employee_id", employeeId);

// Employee selects which company to log time for
const [selectedCompany, setSelectedCompany] = useState(
  assignments[0].companies
);

// Load timesheet for selected company
loadCurrentTimesheet(cycleStart, cycleEnd, cycleType);
```

### Department Cost Allocation

Track hours by department automatically:

```javascript
// Time entries automatically include department_id
const entry = {
  timesheet_id: timesheetId,
  project_id: projectId,
  department_id: employeeContext.department.id, // Auto-filled
  location_id: employeeContext.location.id, // Auto-filled
  duration_minutes: 480, // 8 hours
  description: "Development work",
};

// Query hours by department
const { data } = await getEmployeeHoursByDepartment(
  companyId,
  startDate,
  endDate
);
// Returns: { 'Engineering': 320, 'Sales': 160, ... }
```

### Project Budget Tracking

Monitor project hours vs budget:

```javascript
// Get project hours summary
const { data } = await getProjectHoursSummary(
  projectId,
  projectStartDate,
  projectEndDate
);

console.log(data.totalHours); // Total hours logged
console.log(data.billableHours); // Billable hours only
console.log(data.employees); // Number of people on project

// Compare with project budget
const project = await getProject(projectId);
const budgetRemaining = project.budget_hours - data.totalHours;
```

---

## 🎨 UI Components Integration

### Enhanced TimeEntryGrid

Update TimeEntryGrid to use integrated context:

```jsx
<TimeEntryGrid
  projects={projects} // From useTimesheetIntegration
  entries={timeEntries} // From useTimesheetIntegration
  onSave={addTimeEntry} // Integrated save function
  onUpdate={updateEntry} // Integrated update function
  onDelete={removeEntry} // Integrated delete function
  timesheet={currentTimesheet} // Current timesheet with full context
  selectedCompany={employeeContext?.company} // Employee's company
  userRole={user?.role} // User role for permissions
/>
```

### Manager Approval Dashboard

```jsx
<TimesheetApprovalDashboard
  timesheets={timesheets.filter((t) => t.status === "submitted")}
  onApprove={approveTimesheet}
  onRequestRevision={requestRevision}
  onBulkApprove={bulkApprove}
  onBulkRequestRevision={bulkRequestRevision}
  company={employeeContext?.company}
/>
```

---

## 📈 Reporting Integration

### Dashboard Statistics

```jsx
import { getCompanyTimesheetStats } from "@/lib/timesheetHelpers";

// Get this month's stats
const startOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);
const endOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
);

const { data: stats } = await getCompanyTimesheetStats(
  companyId,
  startOfMonth,
  endOfMonth
);

console.log(stats.totalTimesheets); // Total timesheets
console.log(stats.approvedTimesheets); // Approved count
console.log(stats.totalHours); // Total hours logged
console.log(stats.employees); // Unique employees
```

---

## 🔒 Security Considerations

### Row Level Security (RLS)

The integration includes RLS policies:

1. **Employees** can only:

   - View their own timesheets
   - Edit draft/rejected timesheets
   - View their assigned projects

2. **Managers** can:

   - View all company timesheets
   - Approve/reject submitted timesheets
   - View all company projects

3. **Admins** can:
   - View all timesheets
   - Manage projects
   - Access all data

### Authentication Integration

```jsx
import { useSupabase } from "@/contexts/SupabaseContext";

const { user, session } = useSupabase();

// User ID from auth is used for:
// - Timesheet ownership
// - Time entry creation
// - Approval actions
// - RLS policy enforcement
```

---

## 🚀 Migration Plan

### Phase 1: Database Setup (30 min)

1. Run timesheet tables SQL
2. Run helper functions
3. Verify tables created

### Phase 2: Code Integration (1 hour)

1. Add timesheetHelpers.js
2. Add useTimesheetIntegration hook
3. Update timesheet pages

### Phase 3: Testing (1 hour)

1. Test employee flow
2. Test manager flow
3. Test data integrity

### Phase 4: Deployment (30 min)

1. Deploy database changes
2. Deploy code changes
3. Monitor for issues

---

## 📚 Related Documentation

- **[DATABASE_TIMESHEET_INTEGRATION.md](./DATABASE_TIMESHEET_INTEGRATION.md)** - Database schema
- **[START_HERE.md](./START_HERE.md)** - Optimization overview
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Code patterns

---

## ✅ Success Criteria

Integration is successful when:

1. ✅ Employees can log time to assigned projects
2. ✅ Timesheets respect company boundaries
3. ✅ Paycycles determine timesheet periods
4. ✅ Managers can approve company timesheets
5. ✅ Time entries include department/location
6. ✅ Reporting shows accurate data
7. ✅ RLS policies enforce security

---

**Status:** Ready for Implementation  
**Complexity:** Medium  
**Time Estimate:** 2-3 hours total  
**Impact:** Full integration between modules

---

**Ready to integrate? Start with the database setup in [DATABASE_TIMESHEET_INTEGRATION.md](./DATABASE_TIMESHEET_INTEGRATION.md)!**
