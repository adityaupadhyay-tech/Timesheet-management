"use client";

import { memo, useMemo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import WorkIcon from "@mui/icons-material/Work";
import GroupIcon from "@mui/icons-material/Group";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EventIcon from "@mui/icons-material/Event";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
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
  const [isMyStuffOpen, setIsMyStuffOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [isLoginSettingsOpen, setIsLoginSettingsOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    firstName: '',
    lastName: '',
    menuStyle: '',
    maxClients: 0,
  });
  const [securitySettings, setSecuritySettings] = useState({
    email: '',
    password: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Get current section from URL if on my-stuff page (without useSearchParams)
  useEffect(() => {
    const readSection = () => {
      try {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        setCurrentSection(params.get('section'));
      } catch {
        setCurrentSection(null);
      }
    };
    readSection();
    const onPop = () => readSection();
    window.addEventListener('popstate', onPop);
    // Listen for section changes from card clicks or other navigation
    const onSectionChange = (e) => {
      const sectionId = e?.detail;
      if (sectionId) {
        setCurrentSection(sectionId);
      } else {
        setCurrentSection(null);
      }
    };
    window.addEventListener('app:set-my-stuff-section', onSectionChange);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('app:set-my-stuff-section', onSectionChange);
    };
  }, [pathname]);
  
  // Track client-side mounting to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keep My Stuff dropdown open when on my-stuff page with an active section
  useEffect(() => {
    if (pathname === '/my-stuff' && currentSection) {
      setIsMyStuffOpen(true);
    }
  }, [pathname, currentSection]);

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
      { href: "/my-stuff", label: "My stuff", icon: <PersonIcon />, roles: ['Admin', 'Manager', 'Employee'], hasSubmenu: true },
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

  const goToMyStuffSection = useCallback((sectionId) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    // Save current scroll before navigating (path-only key)
    try {
      const key = `app-scroll:${typeof window !== 'undefined' ? window.location.pathname : ''}${typeof window !== 'undefined' ? window.location.search : ''}`
      const el = document.querySelector('main.flex-1.overflow-auto')
      if (el) sessionStorage.setItem(key, String(el.scrollTop))
    } catch {}
    params.set('section', sectionId);
    const url = `/my-stuff?${params.toString()}`;
    // Open dropdown when navigating to a section
    setIsMyStuffOpen(true);
    if (typeof window !== 'undefined' && window.location.pathname === '/my-stuff') {
      try {
        window.history.replaceState(window.history.state, '', url)
        setCurrentSection(sectionId)
        window.dispatchEvent(new CustomEvent('app:set-my-stuff-section', { detail: sectionId }))
        setTimeout(() => { try { window.dispatchEvent(new CustomEvent('app:restore-scroll')) } catch {} }, 0)
        return
      } catch {}
    }
    router.push(url, { scroll: false });
    setTimeout(() => { try { window.dispatchEvent(new CustomEvent('app:restore-scroll')) } catch {} }, 0)
  }, [router]);

  const saveMainScroll = useCallback(() => {
    try {
      const key = `app-scroll:${typeof window !== 'undefined' ? window.location.pathname : ''}${typeof window !== 'undefined' ? window.location.search : ''}`
      const el = document.querySelector('main.flex-1.overflow-auto')
      if (el) sessionStorage.setItem(key, String(el.scrollTop))
      const winKey = `${key}:win`
      sessionStorage.setItem(winKey, String(window.scrollY || window.pageYOffset || 0))
    } catch {}
  }, [])

  // My Stuff submenu items for Employee role
  const myStuffSubmenu = useMemo(() => {
    if (userRole === 'Employee') {
      return {
        profile: [
          { id: 'basic-info', label: 'Basic Information', icon: <InfoIcon /> },
          { id: 'job-status', label: 'Job Status', icon: <WorkIcon /> },
          { id: 'department', label: 'Department', icon: <GroupIcon /> },
          { id: 'personal-info', label: 'Personal Information', icon: <PersonIcon /> },
          { id: 'paid-leave', label: 'Paid Leave', icon: <EventIcon /> },
          { id: 'emergency-contact', label: 'Emergency Contact', icon: <ContactPhoneIcon /> }
          //{ id: 'performance-coaching', label: 'Performance Coaching', icon: <TrendingUpIcon /> }
        ],
        payroll: [
          { id: 'earning-statement', label: 'Earning Statement', icon: <ReceiptIcon /> },
          { id: 'w2-register', label: 'W-2 Register', icon: <DescriptionIcon /> },
          { id: 'tax-settings', label: 'Tax Settings', icon: <AccountBalanceIcon /> },
          { id: 'direct-deposits', label: 'Direct Deposits', icon: <CreditCardIcon /> },
          { id: 'ytd-info', label: 'Year to Date Information', icon: <CalendarTodayIcon /> },
          { id: 'online-timecard', label: 'On-line Timecard', icon: <AccessTimeIcon /> },
          { id: 'sundial-clock', label: 'Sundial Time Clock', icon: <AccessTimeIcon /> }
        ]
      }
    }
    return null
  }, [userRole]);

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 h-full bg-white shadow-lg z-50 w-64 lg:relative lg:translate-x-0 flex flex-col">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900">Payplus 360</h1>
          </div>
        </div>
        <div className="flex-1 px-2 py-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay - only render after mount to prevent hydration mismatch */}
      {isMounted && isOpen && (
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
            ? "w-64 translate-x-0 lg:w-64"
            : "w-16 -translate-x-full lg:translate-x-0 lg:w-16"
        }
      `}
        suppressHydrationWarning
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {/* Only render conditional content after mount to prevent hydration mismatch */}
          {isMounted && isOpen ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Payplus 360</h1>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-full"
            >
              <span className="text-xl font-semibold text-gray-900">P</span>
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
            
            // Handle My Stuff with dropdown
            if (item.hasSubmenu && userRole === 'Employee' && myStuffSubmenu) {
              return (
                <div key={item.href}>
                  <div 
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50"
                      }
                    `}
                  >
                    <button
                      onClick={() => {
                        if (pathname === '/my-stuff') {
                          // If already on my-stuff page, clear section to show main menu
                          const params = new URLSearchParams(window.location.search);
                          params.delete('section');
                          const url = `/my-stuff${params.toString() ? '?' + params.toString() : ''}`;
                          saveMainScroll();
                          router.push(url, { scroll: false });
                          setCurrentSection(null);
                          window.dispatchEvent(new CustomEvent('app:set-my-stuff-section', { detail: null }));
                          setTimeout(() => { try { window.dispatchEvent(new CustomEvent('app:restore-scroll')) } catch {} }, 0);
                        } else {
                          // Navigate to my-stuff page (main menu)
                          saveMainScroll();
                          router.push('/my-stuff', { scroll: false });
                          setTimeout(() => { try { window.dispatchEvent(new CustomEvent('app:restore-scroll')) } catch {} }, 0);
                        }
                        // Don't open dropdown when clicking main button
                      }}
                      className="flex-1 flex items-center"
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {isMounted && isOpen && <span>{item.label}</span>}
                    </button>
                    {isMounted && isOpen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMyStuffOpen(!isMyStuffOpen);
                        }}
                        className={`
                          ml-2 p-1 rounded transition-colors flex-shrink-0
                          ${
                            isActive
                              ? "hover:bg-primary/80"
                              : "hover:bg-gray-200"
                          }
                        `}
                      >
                        {isMyStuffOpen ? <ExpandMoreIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  
                  {/* Dropdown submenu */}
                  {isMounted && isMyStuffOpen && isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {/* My Profile Section */}
                      <div className="px-3 py-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">My Profile</div>
                        {myStuffSubmenu.profile.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => goToMyStuffSection(subItem.id)}
                            className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                              currentSection === subItem.id
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span className="mr-2 text-base w-5 flex justify-center">{subItem.icon}</span>
                            <span className="text-left">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      {/* My Payroll Section */}
                      <div className="px-3 py-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">My Payroll</div>
                        {myStuffSubmenu.payroll.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => goToMyStuffSection(subItem.id)}
                            className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                              currentSection === subItem.id
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span className="mr-2 text-base w-5 flex justify-center">{subItem.icon}</span>
                            <span className="text-left">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular menu items
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  saveMainScroll();
                  router.push(item.href, { scroll: false });
                  setTimeout(() => { try { window.dispatchEvent(new CustomEvent('app:restore-scroll')) } catch {} }, 0)
                }}
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
                {isMounted && isOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t px-2 py-4 flex-shrink-0">
          {/* User Info */}
          <div className="px-3 py-2">
            {isMounted && isOpen ? (
              <div className="text-sm">
                <div className="bg-blue-100 text-blue-900 font-medium truncate px-3 py-2 rounded-md mb-2 shadow-sm flex items-center justify-between">
                  <span className="flex-1 truncate">{userName}</span>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => setIsLoginSettingsOpen(true)}
                      className="p-1 hover:bg-blue-200 rounded transition-colors flex-shrink-0"
                      title="Login Settings"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-blue-200 rounded transition-colors flex-shrink-0"
                      title="Logout"
                    >
                      <ExitToAppIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium inline-block">
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
          {isMounted && isOpen && (
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

      {/* Login Settings Dialog */}
      <Dialog open={isLoginSettingsOpen} onOpenChange={setIsLoginSettingsOpen}>
        <DialogContent className="w-[600px] h-[650px] max-w-[600px] max-h-[650px] overflow-hidden flex flex-col">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeInSlide {
              from {
                opacity: 0;
                transform: translateX(15px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            @keyframes fadeInSlideReverse {
              from {
                opacity: 0;
                transform: translateX(-15px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .tab-general-content[data-state="active"] {
              animation: fadeInSlide 0.4s ease-out;
            }
            .tab-security-content[data-state="active"] {
              animation: fadeInSlideReverse 0.4s ease-out;
            }
            .tab-general-content,
            .tab-security-content {
              overflow-x: hidden !important;
              width: 100%;
              max-width: 100%;
            }
          `}} />
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Login Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="general" className="w-full transition-all duration-300 ease-in-out">General</TabsTrigger>
              <TabsTrigger value="security" className="w-full transition-all duration-300 ease-in-out">Security</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4 min-h-0 relative">
            <TabsContent 
              value="general" 
              className="mt-0 h-full tab-general-content overflow-x-hidden"
            >
              <div className="space-y-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={generalSettings.firstName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={generalSettings.lastName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Menu Style */}
                <div className="space-y-2">
                  <Label htmlFor="menuStyle">Menu Style</Label>
                  <Select
                    value={generalSettings.menuStyle}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        menuStyle: value,
                      })
                    }
                  >
                    <SelectTrigger id="menuStyle">
                      <SelectValue placeholder="Select menu style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Maximum Clients */}
                <div className="space-y-3">
                  <Label htmlFor="maxClients">Maximum Clients</Label>
                  <div className="space-y-3">
                    {/* Sliding Number Display */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-20 flex items-center justify-center overflow-hidden">
                        <div 
                          key={generalSettings.maxClients}
                          className="text-4xl font-bold text-gray-900"
                          style={{
                            animation: 'slideIn 0.4s ease-out'
                          }}
                        >
                          {generalSettings.maxClients}
                        </div>
                      </div>
                    </div>
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes slideIn {
                        0% {
                          opacity: 0;
                          transform: translateY(10px) scale(0.9);
                        }
                        100% {
                          opacity: 1;
                          transform: translateY(0) scale(1);
                        }
                      }
                    `}} />
                    
                    {/* Slider */}
                    <div className="relative">
                      <style dangerouslySetInnerHTML={{__html: `
                        #maxClients-slider::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #3b82f6;
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          transition: transform 0.2s;
                        }
                        #maxClients-slider::-webkit-slider-thumb:hover {
                          transform: scale(1.1);
                        }
                        #maxClients-slider::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #3b82f6;
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          transition: transform 0.2s;
                        }
                        #maxClients-slider::-moz-range-thumb:hover {
                          transform: scale(1.1);
                        }
                      `}} />
                      <input
                        type="range"
                        id="maxClients-slider"
                        min="0"
                        max="100"
                        value={generalSettings.maxClients}
                        onChange={(e) => {
                          setGeneralSettings({
                            ...generalSettings,
                            maxClients: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(generalSettings.maxClients / 100) * 100}%, #e5e7eb ${(generalSettings.maxClients / 100) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    
                    {/* Quick Adjust Buttons */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxClients: Math.max(0, generalSettings.maxClients - 10),
                          })
                        }
                        disabled={generalSettings.maxClients === 0}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxClients: Math.max(0, generalSettings.maxClients - 1),
                          })
                        }
                        disabled={generalSettings.maxClients === 0}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        aria-label="Decrease"
                      >
                        <RemoveIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <div className="w-20 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={generalSettings.maxClients}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setGeneralSettings({
                              ...generalSettings,
                              maxClients: Math.max(0, Math.min(100, value)),
                            });
                          }}
                          className="text-center text-sm font-semibold h-8"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxClients: Math.min(100, generalSettings.maxClients + 1),
                          })
                        }
                        disabled={generalSettings.maxClients >= 100}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        aria-label="Increase"
                      >
                        <AddIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxClients: Math.min(100, generalSettings.maxClients + 10),
                          })
                        }
                        disabled={generalSettings.maxClients >= 100}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Access */}
                <div className="space-y-2">
                  <Label>User Access</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // TODO: Implement manage access functionality
                      console.log('Manage Access clicked');
                    }}
                  >
                    Manage Access
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent 
              value="security" 
              className="mt-0 h-full tab-security-content overflow-x-hidden"
            >
              <div className="space-y-4">
                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={securitySettings.email}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Password Update */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={securitySettings.password}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          password: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon className="h-5 w-5" />
                      ) : (
                        <VisibilityIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Question */}
                <div className="space-y-2">
                  <Label htmlFor="securityQuestion">Security Question</Label>
                  <Select
                    value={securitySettings.securityQuestion}
                    onValueChange={(value) =>
                      setSecuritySettings({
                        ...securitySettings,
                        securityQuestion: value,
                      })
                    }
                  >
                    <SelectTrigger id="securityQuestion">
                      <SelectValue placeholder="Select a security question" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother-maiden-name">
                        What is your mother's maiden name?
                      </SelectItem>
                      <SelectItem value="birth-city">
                        What city were you born in?
                      </SelectItem>
                      <SelectItem value="first-pet">
                        What was the name of your first pet?
                      </SelectItem>
                      <SelectItem value="elementary-school">
                        What was the name of your elementary school?
                      </SelectItem>
                      <SelectItem value="first-car">
                        What was the make and model of your first car?
                      </SelectItem>
                      <SelectItem value="childhood-nickname">
                        What was your childhood nickname?
                      </SelectItem>
                      <SelectItem value="favorite-teacher">
                        What was the name of your favorite teacher?
                      </SelectItem>
                      <SelectItem value="best-friend">
                        What was the name of your best friend growing up?
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Security Answer */}
                <div className="space-y-2">
                  <Label htmlFor="securityAnswer">Security Answer</Label>
                  <Input
                    id="securityAnswer"
                    type="text"
                    placeholder="Enter your security answer"
                    value={securitySettings.securityAnswer}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        securityAnswer: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default Sidebar
