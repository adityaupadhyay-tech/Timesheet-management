"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployeeFilters({
  companyFilter,
  setCompanyFilter,
  jobRoleFilter,
  setJobRoleFilter,
  departmentFilter,
  setDepartmentFilter,
}) {
  return (
    <div className="px-6 pb-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="company-filter">Company</Label>
          <Input
            id="company-filter"
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="job-filter">Job Role</Label>
          <Input
            id="job-filter"
            placeholder="Filter by job role..."
            value={jobRoleFilter}
            onChange={(e) => setJobRoleFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dept-filter">Department</Label>
          <Input
            id="dept-filter"
            placeholder="Filter by department..."
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

