"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, ExpandMore, ExpandLess } from "@mui/icons-material";

export default function EmployeeTable({
  employees,
  expandedRows,
  onToggleExpand,
  onEditEmployee,
}) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium mb-2">No Employees Found</p>
        <p className="text-sm">
          Connect your Supabase database to see employees here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 w-10"></th>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Job Title</th>
            <th className="text-left p-3">Company</th>
            <th className="text-left p-3">Department</th>
            <th className="text-left p-3">Location</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <React.Fragment key={employee.id}>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 align-top">
                  <button
                    onClick={() => onToggleExpand(employee.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {expandedRows[employee.id] ? (
                      <ExpandLess className="w-4 h-4" />
                    ) : (
                      <ExpandMore className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="p-3">
                  <div className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {employee.email}
                </td>
                <td className="p-3 text-sm">
                  {employee.company_assignments?.[0]?.job_title || "N/A"}
                  {employee.company_assignments?.length > 1 &&
                    ` +${employee.company_assignments.length - 1}`}
                </td>
                <td className="p-3 text-sm">
                  {employee.company_assignments?.[0]?.company_name || "N/A"}
                </td>
                <td className="p-3 text-sm">
                  {employee.department_assignments?.[0]?.department_name ||
                    "N/A"}
                </td>
                <td className="p-3 text-sm">
                  {employee.location_assignments?.[0]?.location_name || "N/A"}
                </td>
                <td className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditEmployee(employee)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </td>
              </tr>

              {expandedRows[employee.id] &&
                (employee.company_assignments?.slice(1) || []).map(
                  (assignment, index) => (
                    <tr key={index} className="border-b bg-gray-50">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="p-3 text-sm">
                        {assignment.job_title || "N/A"}
                      </td>
                      <td className="p-3 text-sm">
                        {assignment.company_name || "N/A"}
                      </td>
                      <td className="p-3 text-sm"></td>
                      <td className="p-3 text-sm"></td>
                      <td></td>
                    </tr>
                  )
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

