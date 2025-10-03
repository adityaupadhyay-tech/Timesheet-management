"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Building from "@mui/icons-material/Business";
import Users from "@mui/icons-material/People";
import Settings from "@mui/icons-material/Settings";
import BarChart from "@mui/icons-material/BarChart";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import { useSupabase } from "@/contexts/SupabaseContext";

export default function AdministrationPage() {
  const { user, loading } = useSupabase();

  // Fallback user data if not authenticated
  const currentUser = user
    ? {
        name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Admin User",
        role: "admin",
        email: user.email,
      }
    : {
        name: "Admin User",
        role: "admin",
        email: "admin@company.com",
      };

  const [activeSection, setActiveSection] = useState("overview");
  const [showNavigation, setShowNavigation] = useState(false);

  const adminSections = [
    {
      id: "overview",
      title: "Overview",
      description: "Administration overview and navigation",
      icon: <Settings />,
    },
    {
      id: "company",
      title: "Company Setup",
      description:
        "Setup company structure, locations, departments, and employees",
      icon: <Building />,
    },
    {
      id: "users",
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: <Users />,
    },
    {
      id: "monitoring",
      title: "System Monitoring",
      description: "Monitor system performance and usage statistics",
      icon: <BarChart />,
    },
  ];

  const renderContent = () => {
    if (!showNavigation) {
      // Show card selection menu
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveSection("company");
              setShowNavigation(true);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2" />
                Company Setup
              </CardTitle>
              <CardDescription>
                Setup company structure, locations, departments, and employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configure your organization's structure including locations,
                departments, and employee assignments.
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveSection("users");
              setShowNavigation(true);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create, modify, and manage user accounts, roles, and access
                permissions.
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveSection("monitoring");
              setShowNavigation(true);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2" />
                System Monitoring
              </CardTitle>
              <CardDescription>
                Monitor system performance and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View system performance metrics, usage statistics, and health
                monitoring.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show navigation when a card is selected
    switch (activeSection) {
      case "company":
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection("overview");
                  setShowNavigation(false);
                }}
                className="flex items-center mb-4"
              >
                ← Back to Administration
              </Button>
            </div>
            <AdminDashboard />
          </>
        );
      case "users":
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection("overview");
                  setShowNavigation(false);
                }}
                className="flex items-center mb-4"
              >
                ← Back to Administration
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeManagement />
              </CardContent>
            </Card>
          </>
        );
      case "monitoring":
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection("overview");
                  setShowNavigation(false);
                }}
                className="flex items-center mb-4"
              >
                ← Back to Administration
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <CardDescription>
                  Monitor system performance and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500">
                  Monitoring module coming soon...
                </p>
              </CardContent>
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            System administration, configuration, and advanced management
            features
          </p>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  );
}
