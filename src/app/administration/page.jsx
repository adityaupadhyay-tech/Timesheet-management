"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
import Link from "@mui/icons-material/Link";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Public from "@mui/icons-material/Public";
import PersonAdd from "@mui/icons-material/PersonAdd";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import Assessment from "@mui/icons-material/Assessment";
import FileUpload from "@mui/icons-material/FileUpload";
import Description from "@mui/icons-material/Description";
import FolderOpen from "@mui/icons-material/FolderOpen";
import IntegrationInstructions from "@mui/icons-material/IntegrationInstructions";
import Security from "@mui/icons-material/Security";
import Assignment from "@mui/icons-material/Assignment";
import Logout from "@mui/icons-material/Logout";
import Upgrade from "@mui/icons-material/Upgrade";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useSupabase } from "@/contexts/SupabaseContext";

// Dynamically import heavy components with loading states
const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard"),
  { 
    loading: () => <LoadingSpinner message="Loading Company Dashboard..." />,
    ssr: false 
  }
);

const EmployeeManagement = dynamic(
  () => import("@/components/admin/EmployeeManagement"),
  { 
    loading: () => <LoadingSpinner message="Loading Employee Management..." />,
    ssr: false 
  }
);

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
  ];

  const renderContent = () => {
    if (!showNavigation) {
      // Show card selection menu
      return (
        <div className="space-y-8">
          {/* Resources Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resources
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  window.location.href = "/administration/external-links";
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link className="mr-2" />
                    External Link Manager
                  </CardTitle>
                  <CardDescription>
                    Manage external links and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Configure and manage external links, APIs, and third-party
                    integrations.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  window.location.href = "/administration/resource-admin";
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AdminPanelSettings className="mr-2" />
                    Resource Admin
                  </CardTitle>
                  <CardDescription>
                    Administrative resource management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Manage system resources, configurations, and administrative
                    settings.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  window.location.href = "/administration/site-branding";
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Public className="mr-2" />
                    Site Branding
                  </CardTitle>
                  <CardDescription>
                    Manage site branding and customization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Configure and manage site branding, themes, logos, and
                    visual customization.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Online Hiring Admin Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Online Hiring Admin
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Client Setup - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PersonAdd className="mr-2" />
                    Client Setup
                  </CardTitle>
                  <CardDescription>
                    Configure client settings for online hiring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set up and configure client accounts for the online hiring
                    system.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configuration Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configuration
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("System Reports - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Assessment className="mr-2" />
                    System Reports
                  </CardTitle>
                  <CardDescription>
                    Generate and manage system reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create, schedule, and manage various system reports and
                    analytics.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  window.location.href = "/administration/import-w2s";
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileUpload className="mr-2" />
                    Import W-2s
                  </CardTitle>
                  <CardDescription>
                    Import and manage W-2 tax forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Import, process, and manage W-2 tax forms for employees.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  alert("Earn Statements Configuration - Coming Soon!")
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Description className="mr-2" />
                    Earn Statements Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure earning statement settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set up and configure earning statement formats and
                    templates.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  alert("Document Type Administration - Coming Soon!")
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="mr-2" />
                    Document Type Administration
                  </CardTitle>
                  <CardDescription>
                    Manage document types and templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Configure and manage different document types and their
                    templates.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Sundial Integration - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IntegrationInstructions className="mr-2" />
                    Sundial Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Sundial system integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set up and manage integration with the Sundial time tracking
                    system.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { window.location.href = '/administration/company-setup' }}
              >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2" />
                Company Setup
              </CardTitle>
                  <CardDescription>
                    Setup company structure, locations, departments, and
                    employees
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
                onClick={() => { window.location.href = '/administration/user-management' }}
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
            </div>
          </div>

          {/* Access Management Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Access Management
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Role Assignment - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Security className="mr-2" />
                    Role Assignment
                  </CardTitle>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Assign and manage user roles, permissions, and access
                    levels.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Template Manager - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Assignment className="mr-2" />
                    Template Manager
                  </CardTitle>
                  <CardDescription>
                    Manage system templates and forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create, edit, and manage system templates, forms, and
                    document layouts.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Employee Logout Manager - Coming Soon!")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Logout className="mr-2" />
                    Employee Logout Manager
                  </CardTitle>
                  <CardDescription>
                    Manage employee logout sessions
                  </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                    Monitor and manage employee logout sessions and security
                    settings.
              </p>
            </CardContent>
          </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => alert("Upgrade Legacy Accounts - Coming Soon!")}
              >
            <CardHeader>
              <CardTitle className="flex items-center">
                    <Upgrade className="mr-2" />
                    Upgrade Legacy Accounts
              </CardTitle>
                  <CardDescription>
                    Upgrade legacy user accounts
                  </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                    Upgrade and migrate legacy user accounts to the new system
                    format.
              </p>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      );
    }

    // Show navigation when a card is selected
    switch (activeSection) {
      case "company":
        return (
          <>
            <PageHeader
              title="Company Setup"
              subtitle="Setup company structure, locations, departments, and employees"
              icon={<Building />}
              breadcrumbs={[
                { label: "Administration", href: "/administration" },
                { label: "Company Setup" },
              ]}
            />
            <AdminDashboard />
          </>
        );
      case "users":
        return (
          <>
            <PageHeader
              title="User Management"
              subtitle="Manage user accounts, roles, and permissions"
              icon={<Users />}
              breadcrumbs={[
                { label: "Administration", href: "/administration" },
                { label: "User Management" },
              ]}
            />
            <EmployeeManagement />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        {/* Only show main Administration header when in overview mode */}
        {!showNavigation && (
          <PageHeader
            title="Administration"
            subtitle="System administration, configuration, and advanced management features"
            icon={<Settings />}
          />
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  );
}
