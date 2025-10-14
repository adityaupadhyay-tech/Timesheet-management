'use client';

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { Globe, Upload, X, Info, Edit2, RefreshCw, Mail } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function SiteBrandingPage() {
  const { user } = useSupabase()
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin'
  } : {
    name: 'Admin User',
    role: 'admin'
  }

  // Global site branding state
  const [globalBranding, setGlobalBranding] = useState({
    siteLogo: null,
    siteTitle: 'Timesheet Management System',
    appTitle: 'TMS Pro',
    appTheme: 'blue',
    mobileAppIcon: null
  });

  // Companies list with custom branding
  const [companies, setCompanies] = useState([
    { 
      id: 1, 
      name: 'Acme Corporation', 
      hasCustomBranding: false,
      branding: null
    },
    { 
      id: 2, 
      name: 'Tech Solutions Inc', 
      hasCustomBranding: true,
      branding: {
        siteLogo: null,
        siteTitle: 'Tech Solutions Portal',
        appTitle: 'TS Portal',
        appTheme: 'green',
        mobileAppIcon: null
      }
    },
    { 
      id: 3, 
      name: 'Global Enterprises', 
      hasCustomBranding: false,
      branding: null
    },
  ]);

  // Dialog states
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editForm, setEditForm] = useState({
    siteLogo: null,
    siteTitle: '',
    appTitle: '',
    appTheme: 'blue',
    mobileAppIcon: null,
    sendEmailNotice: false
  });

  // File preview states
  const [logoPreview, setLogoPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  // Theme options
  const themeOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' },
  ];

  // Handle global branding edit
  const handleEditGlobal = () => {
    setEditForm({
      siteLogo: globalBranding.siteLogo,
      siteTitle: globalBranding.siteTitle,
      appTitle: globalBranding.appTitle,
      appTheme: globalBranding.appTheme,
      mobileAppIcon: globalBranding.mobileAppIcon,
      sendEmailNotice: false
    });
    setLogoPreview(globalBranding.siteLogo);
    setIconPreview(globalBranding.mobileAppIcon);
    setIsEditingGlobal(true);
  };

  // Handle company branding edit
  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    const branding = company.hasCustomBranding ? company.branding : globalBranding;
    setEditForm({
      siteLogo: branding.siteLogo,
      siteTitle: branding.siteTitle,
      appTitle: branding.appTitle,
      appTheme: branding.appTheme,
      mobileAppIcon: branding.mobileAppIcon,
      sendEmailNotice: false
    });
    setLogoPreview(branding.siteLogo);
    setIconPreview(branding.mobileAppIcon);
    setIsEditingCompany(true);
  };

  // Handle file upload for logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, siteLogo: reader.result }));
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for icon
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, mobileAppIcon: reader.result }));
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save global branding
  const handleSaveGlobal = () => {
    const { sendEmailNotice, ...brandingData } = editForm;
    setGlobalBranding(brandingData);
    
    if (sendEmailNotice) {
      // Simulate email notification
      alert('Email notification will be sent to all administrators about the global branding changes.');
    }
    
    setIsEditingGlobal(false);
    setLogoPreview(null);
    setIconPreview(null);
  };

  // Save company branding
  const handleSaveCompany = () => {
    const { sendEmailNotice, ...brandingData } = editForm;
    
    setCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === selectedCompany.id
          ? { ...company, hasCustomBranding: true, branding: brandingData }
          : company
      )
    );
    
    if (sendEmailNotice) {
      // Simulate email notification
      alert(`Email notification will be sent to ${selectedCompany.name} administrators about the branding changes.`);
    }
    
    setIsEditingCompany(false);
    setSelectedCompany(null);
    setLogoPreview(null);
    setIconPreview(null);
  };

  // Reset company to global branding
  const handleResetToGlobal = (companyId) => {
    if (window.confirm('Are you sure you want to reset this company to global branding?')) {
      setCompanies(prevCompanies =>
        prevCompanies.map(company =>
          company.id === companyId
            ? { ...company, hasCustomBranding: false, branding: null }
            : company
        )
      );
    }
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Site Branding"
          subtitle="Manage site branding, themes, logos, and visual customization"
          icon={<Globe />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'Site Branding' },
          ]}
        />

        <div className="space-y-6">
          {/* Global Site Branding */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Global Site Branding
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Default branding applied to all companies unless customized individually
                  </CardDescription>
                </div>
                <Button onClick={handleEditGlobal} size="sm" className="flex-shrink-0 w-full sm:w-auto">
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit Global Settings</span>
                  <span className="sm:hidden">Edit Settings</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Site Logo</Label>
                    <div className="mt-2 border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-32">
                      {globalBranding.siteLogo ? (
                        <img src={globalBranding.siteLogo} alt="Site Logo" className="max-h-24 max-w-full object-contain" />
                      ) : (
                        <span className="text-gray-400">No logo uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Site Title</Label>
                    <p className="mt-1 text-sm text-gray-900">{globalBranding.siteTitle}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">App Title</Label>
                    <p className="mt-1 text-sm text-gray-900">{globalBranding.appTitle}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mobile App Icon</Label>
                    <div className="mt-2 border rounded-lg p-4 bg-gray-50 flex items-center justify-center h-32">
                      {globalBranding.mobileAppIcon ? (
                        <img src={globalBranding.mobileAppIcon} alt="App Icon" className="max-h-24 max-w-full object-contain" />
                      ) : (
                        <span className="text-gray-400">No icon uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">App Theme</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {themeOptions.map(theme => (
                        theme.value === globalBranding.appTheme && (
                          <div key={theme.value} className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded ${theme.color}`}></div>
                            <span className="text-sm text-gray-900">{theme.label}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company-Specific Branding */}
          <Card>
            <CardHeader className="border-b">
              <div>
                <CardTitle>Company-Specific Branding</CardTitle>
                <CardDescription className="mt-1">
                  Customize branding for individual companies. Companies without custom branding will use global settings.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-medium text-gray-900">{company.name}</h3>
                          {company.hasCustomBranding ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Custom Branding
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Using Global Settings
                            </span>
                          )}
                        </div>
                        {company.hasCustomBranding && company.branding && (
                          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-3">
                            <span><span className="font-medium">Title:</span> {company.branding.siteTitle}</span>
                            <span><span className="font-medium">App:</span> {company.branding.appTitle}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          className="flex-shrink-0"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {company.hasCustomBranding ? 'Edit' : 'Customize'}
                        </Button>
                        {company.hasCustomBranding && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetToGlobal(company.id)}
                            className="text-gray-600 flex-shrink-0"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Reset to Global</span>
                            <span className="sm:hidden">Reset</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Mobile App Icon Requirements</h4>
                  <p className="text-sm text-blue-800">
                    Icons are used for multiple sizes: 192×192, 168×168, 144×144, 96×96, 72×72, and 48×48 pixels. 
                    Please upload a high-resolution square icon (minimum 192×192) for best results across all devices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Global Branding Dialog */}
        <Dialog open={isEditingGlobal} onOpenChange={setIsEditingGlobal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Global Site Branding</DialogTitle>
              <DialogDescription>
                Configure the default branding settings for your entire site
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Site Logo */}
              <div className="space-y-2">
                <Label htmlFor="siteLogo">Site Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="border rounded-lg p-2 bg-gray-50 h-20 w-20 flex items-center justify-center">
                      <img src={logoPreview} alt="Logo Preview" className="max-h-16 max-w-16 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="siteLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditForm(prev => ({ ...prev, siteLogo: null }));
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Site Title */}
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title *</Label>
                <Input
                  id="siteTitle"
                  value={editForm.siteTitle}
                  onChange={(e) => setEditForm({ ...editForm, siteTitle: e.target.value })}
                  placeholder="Enter site title"
                />
              </div>

              {/* App Title */}
              <div className="space-y-2">
                <Label htmlFor="appTitle">App Title *</Label>
                <Input
                  id="appTitle"
                  value={editForm.appTitle}
                  onChange={(e) => setEditForm({ ...editForm, appTitle: e.target.value })}
                  placeholder="Enter app title"
                />
              </div>

              {/* App Theme */}
              <div className="space-y-2">
                <Label htmlFor="appTheme">App Theme</Label>
                <Select
                  value={editForm.appTheme}
                  onValueChange={(value) => setEditForm({ ...editForm, appTheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded ${theme.color}`}></div>
                          {theme.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile App Icon */}
              <div className="space-y-2">
                <Label htmlFor="mobileAppIcon">Mobile App Icon</Label>
                <div className="flex items-center gap-4">
                  {iconPreview && (
                    <div className="border rounded-lg p-2 bg-gray-50 h-20 w-20 flex items-center justify-center">
                      <img src={iconPreview} alt="Icon Preview" className="max-h-16 max-w-16 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="mobileAppIcon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {iconPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditForm(prev => ({ ...prev, mobileAppIcon: null }));
                        setIconPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, minimum 192×192 pixels
                </p>
              </div>

              {/* Email Notification */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmailNoticeGlobal"
                    checked={editForm.sendEmailNotice}
                    onChange={(e) => setEditForm({ ...editForm, sendEmailNotice: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="sendEmailNoticeGlobal" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-normal">Send email notification to all administrators</span>
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Notify administrators about global branding changes
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingGlobal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveGlobal}
                disabled={!editForm.siteTitle || !editForm.appTitle}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Company Branding Dialog */}
        <Dialog open={isEditingCompany} onOpenChange={setIsEditingCompany}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company Branding</DialogTitle>
              <DialogDescription>
                Customize branding for {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Site Logo */}
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Site Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="border rounded-lg p-2 bg-gray-50 h-20 w-20 flex items-center justify-center">
                      <img src={logoPreview} alt="Logo Preview" className="max-h-16 max-w-16 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditForm(prev => ({ ...prev, siteLogo: null }));
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Site Title */}
              <div className="space-y-2">
                <Label htmlFor="companySiteTitle">Site Title *</Label>
                <Input
                  id="companySiteTitle"
                  value={editForm.siteTitle}
                  onChange={(e) => setEditForm({ ...editForm, siteTitle: e.target.value })}
                  placeholder="Enter site title"
                />
              </div>

              {/* App Title */}
              <div className="space-y-2">
                <Label htmlFor="companyAppTitle">App Title *</Label>
                <Input
                  id="companyAppTitle"
                  value={editForm.appTitle}
                  onChange={(e) => setEditForm({ ...editForm, appTitle: e.target.value })}
                  placeholder="Enter app title"
                />
              </div>

              {/* App Theme */}
              <div className="space-y-2">
                <Label htmlFor="companyAppTheme">App Theme</Label>
                <Select
                  value={editForm.appTheme}
                  onValueChange={(value) => setEditForm({ ...editForm, appTheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded ${theme.color}`}></div>
                          {theme.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile App Icon */}
              <div className="space-y-2">
                <Label htmlFor="companyMobileAppIcon">Mobile App Icon</Label>
                <div className="flex items-center gap-4">
                  {iconPreview && (
                    <div className="border rounded-lg p-2 bg-gray-50 h-20 w-20 flex items-center justify-center">
                      <img src={iconPreview} alt="Icon Preview" className="max-h-16 max-w-16 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="companyMobileAppIcon"
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {iconPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditForm(prev => ({ ...prev, mobileAppIcon: null }));
                        setIconPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, minimum 192×192 pixels
                </p>
              </div>

              {/* Email Notification */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmailNoticeCompany"
                    checked={editForm.sendEmailNotice}
                    onChange={(e) => setEditForm({ ...editForm, sendEmailNotice: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="sendEmailNoticeCompany" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-normal">Send email notification to company administrators</span>
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Notify {selectedCompany?.name} administrators about branding changes
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingCompany(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCompany}
                disabled={!editForm.siteTitle || !editForm.appTitle}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

