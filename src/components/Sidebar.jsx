"use client";

import { memo, useMemo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BuildIcon from "@mui/icons-material/Build";
import FolderIcon from "@mui/icons-material/Folder";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
import { useUser } from "@/contexts/UserContext";

/**
 * @typedef {Object} SidebarProps
 * @property {UserRole} userRole
 * @property {string} userName
 * @property {boolean} isOpen
 * @property {function(): void} onToggle
 */
const Sidebar = memo(function Sidebar({ userRole, userName, isOpen, onToggle }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [selectedPersona, setSelectedPersona] = useState(userRole);

  // Update selectedPersona when userRole changes
  useEffect(() => {
    setSelectedPersona(userRole);
  }, [userRole]);

  const handlePersonaChange = useCallback((persona) => {
    setSelectedPersona(persona);
    // Update the user's role in the context
    if (setUser && user) {
      setUser({
        ...user,
        role: persona
      });
    }
    console.log('Switched to persona:', persona);
  }, [setUser, user]);

  const menuItems = useMemo(() => {
    const allItems = [
      { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon />, roles: ['Admin', 'Manager', 'Employee'] },
      { href: "/my-stuff", label: "My stuff", icon: <PersonIcon />, roles: ['Admin', 'Manager', 'Employee'] },
      {
        href: "/timesheet",
        label: "Timesheet management",
        icon: <ScheduleIcon />,
        roles: ['Admin', 'Manager']
      },
      {
        href: "/pto-requests",
        label: "PTO Requests",
        icon: <BeachAccessIcon />,
        roles: ['Admin', 'Manager']
      },
      { href: "/personnel", label: "Personnel", icon: <PeopleIcon />, roles: ['Admin', 'Manager'] },
      { href: "/payroll", label: "Payroll", icon: <AttachMoneyIcon />, roles: ['Admin', 'Manager'] },
      { href: "/tools", label: "Tools", icon: <BuildIcon />, roles: ['Admin', 'Manager'] },
      { href: "/resources", label: "Resources", icon: <FolderIcon />, roles: ['Admin', 'Manager', 'Employee'] },
      {
        href: "/administration",
        label: "Administration",
        icon: <AdminPanelSettingsIcon />,
        roles: ['Admin']
      },
    ];
    
    // Filter menu items based on user role
    return allItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-16 -translate-x-full lg:translate-x-0"
        }
        ${!isOpen && "lg:w-16"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isOpen ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Timesheet</h1>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-full"
            >
              <span className="text-xl font-semibold text-gray-900">T</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:flex hidden p-1"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t px-2 py-4 flex-shrink-0">
          {/* User Info */}
          <div className="px-3 py-2">
            {isOpen ? (
              <div className="text-sm text-gray-700">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium mt-1 inline-block">
                  {userRole}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {userName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Persona Switcher */}
          {isOpen && (
            <div className="px-3 py-1">
              <div className="text-xs text-gray-500 font-medium mb-1">Switch View</div>
              <div className="space-y-0.5">
                {[
                  { key: 'Admin', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
                  { key: 'Manager', label: 'Manager', color: 'bg-orange-100 text-orange-700' },
                  { key: 'Employee', label: 'Employee', color: 'bg-green-100 text-green-700' }
                ].map((persona) => (
                  <button
                    key={persona.key}
                    onClick={() => handlePersonaChange(persona.key)}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedPersona === persona.key
                        ? persona.color
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {persona.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Sidebar
