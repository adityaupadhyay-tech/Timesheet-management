import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Building, MapPin, Users, Briefcase } from "lucide-react";

export default function CompanyDetailView({ data, loading, onClose }) {
  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading company details...</span>
          </div>
        </div>
      </div>
    );
  }

  const { company_info, locations, departments, employees } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Building className="w-6 h-6 mr-3 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {company_info.name}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-lg font-semibold">{company_info.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-lg">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company_info.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {company_info.status}
                    </span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-gray-700">
                    {company_info.description || "No description provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Locations ({locations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <p className="text-gray-500">No locations found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.address}, {location.city}, {location.state}{" "}
                        {location.postal_code}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Managers:{" "}
                        {location.managers
                          ? location.managers.join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Departments ({departments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <p className="text-gray-500">No departments found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((department) => (
                    <div key={department.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">
                        {department.name}
                      </h3>
                      {department.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {department.description}
                        </p>
                      )}
                      {department.location_name && (
                        <p className="text-sm text-gray-500 mt-2">
                          Location: {department.location_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Managers:{" "}
                        {department.managers
                          ? department.managers.join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Employees ({employees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <p className="text-gray-500">No employees found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Job Title</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div className="font-medium">
                              {employee.full_name}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {employee.email}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.job_title || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.department_name || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.location_name || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
