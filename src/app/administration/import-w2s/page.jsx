'use client';

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { FileText, Upload, X, AlertTriangle, Download, Trash2, CheckCircle2, FileCheck, Search, Filter } from 'lucide-react'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function ImportW2sPage() {
  const { user } = useSupabase()
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin'
  } : {
    name: 'Admin User',
    role: 'admin'
  }

  const [activeTab, setActiveTab] = useState('add');
  
  // W-2 files state
  const [w2Files, setW2Files] = useState([
    { 
      id: 1, 
      fileName: 'W2_2023_Employees_Batch1.solv', 
      uploadDate: '2024-01-15', 
      uploadedBy: 'John Admin',
      fileSize: '2.4 MB',
      employeeCount: 45,
      taxYear: 2023,
      serviceType: 'PEO',
      fileType: 'SOLV',
      status: 'processed'
    },
    { 
      id: 2, 
      fileName: 'W2_2023_Employees_Batch2.csv', 
      uploadDate: '2024-01-20', 
      uploadedBy: 'Jane Manager',
      fileSize: '1.8 MB',
      employeeCount: 32,
      taxYear: 2023,
      serviceType: 'ASO',
      fileType: 'CSV',
      status: 'processed'
    },
    { 
      id: 3, 
      fileName: 'W2_2022_Final.solv', 
      uploadDate: '2023-02-10', 
      uploadedBy: 'John Admin',
      fileSize: '3.1 MB',
      employeeCount: 78,
      taxYear: 2022,
      serviceType: 'PEO',
      fileType: 'SOLV',
      status: 'processed'
    },
  ]);

  // Upload state
  const [uploadForm, setUploadForm] = useState({
    taxYear: new Date().getFullYear() - 1,
    serviceType: 'PEO',
    fileType: 'SOLV',
    file: null,
    description: ''
  });

  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTaxYear, setFilterTaxYear] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterFileType, setFilterFileType] = useState('all');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file: file }));
      setFilePreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type
      });
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setUploadForm(prev => ({ ...prev, file: null }));
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById('w2FileInput');
    if (fileInput) fileInput.value = '';
  };

  // Handle W-2 upload
  const handleUpload = async () => {
    if (!uploadForm.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload delay
    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        fileName: uploadForm.file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: currentUser.name,
        fileSize: filePreview.size,
        employeeCount: Math.floor(Math.random() * 50) + 20, // Simulated
        taxYear: uploadForm.taxYear,
        serviceType: uploadForm.serviceType,
        fileType: uploadForm.fileType,
        status: 'processed'
      };

      setW2Files(prev => [newFile, ...prev]);
      
      // Reset form
      setUploadForm({
        taxYear: new Date().getFullYear() - 1,
        serviceType: 'PEO',
        fileType: 'SOLV',
        file: null,
        description: ''
      });
      setFilePreview(null);
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('w2FileInput');
      if (fileInput) fileInput.value = '';

      alert('W-2 file uploaded successfully!');
    }, 2000);
  };

  // Handle delete confirmation
  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (fileToDelete) {
      setW2Files(prev => prev.filter(file => file.id !== fileToDelete.id));
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  // Generate year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Get unique tax years from files
  const getUniqueTaxYears = () => {
    const years = [...new Set(w2Files.map(file => file.taxYear))];
    return years.sort((a, b) => b - a);
  };

  // Filter files based on search and filter criteria
  const getFilteredFiles = () => {
    return w2Files.filter(file => {
      // Search filter
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tax year filter
      const matchesTaxYear = filterTaxYear === 'all' || file.taxYear === parseInt(filterTaxYear);
      
      // Service type filter
      const matchesServiceType = filterServiceType === 'all' || file.serviceType === filterServiceType;
      
      // File type filter
      const matchesFileType = filterFileType === 'all' || file.fileType === filterFileType;
      
      return matchesSearch && matchesTaxYear && matchesServiceType && matchesFileType;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterTaxYear('all');
    setFilterServiceType('all');
    setFilterFileType('all');
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Import W-2s"
          subtitle="Import and manage W-2 tax forms for employees"
          icon={<FileText />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'Import W-2s' },
          ]}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="add">
              <Upload className="h-4 w-4 mr-2" />
              Add W-2s
            </TabsTrigger>
            <TabsTrigger value="remove">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove W-2 Files
            </TabsTrigger>
          </TabsList>

          {/* Add W-2s Tab */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Upload W-2 Files</CardTitle>
                <CardDescription>
                  Upload W-2 tax forms in SOLV or CSV format. Files will be processed and associated with employee records.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Tax Year Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="taxYear">Tax Year *</Label>
                    <select
                      id="taxYear"
                      value={uploadForm.taxYear}
                      onChange={(e) => setUploadForm({ ...uploadForm, taxYear: parseInt(e.target.value) })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {getYearOptions().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Service Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <select
                      id="serviceType"
                      value={uploadForm.serviceType}
                      onChange={(e) => setUploadForm({ ...uploadForm, serviceType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="PEO">PEO (Professional Employer Organization)</option>
                      <option value="ASO">ASO (Administrative Services Organization)</option>
                    </select>
                  </div>

                  {/* File Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="fileType">File Type *</Label>
                    <select
                      id="fileType"
                      value={uploadForm.fileType}
                      onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="SOLV">SOLV file</option>
                      <option value="CSV">CSV file</option>
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="w2FileInput">W-2 File ({uploadForm.fileType}) *</Label>
                    {!filePreview ? (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <Input
                          id="w2FileInput"
                          type="file"
                          accept={uploadForm.fileType === 'CSV' ? '.csv,text/csv' : '.solv'}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="w2FileInput" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Click to upload W-2 file
                            </p>
                            <p className="text-xs text-gray-500">
                              {uploadForm.fileType === 'CSV' ? 'CSV files only' : 'SOLV files only'}, up to 50MB
                            </p>
                          </div>
                        </Label>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{filePreview.name}</p>
                              <p className="text-xs text-gray-500">{filePreview.size}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Add notes about this W-2 batch (e.g., Department, Location)"
                      rows={3}
                      disabled={isUploading}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uploading...</span>
                        <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpload}
                      disabled={!uploadForm.file || isUploading}
                      className="min-w-[150px]"
                    >
                      {isUploading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload W-2
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <FileCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>W-2 files must be in SOLV or CSV format</li>
                      <li>Ensure employee SSN/Tax ID numbers are clearly visible</li>
                      <li>Multiple W-2s can be included in a single file</li>
                      <li>Select the correct file type before uploading</li>
                      <li>Files are automatically processed and matched to employee records</li>
                      <li>You can upload multiple batches for the same tax year</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remove W-2 Files Tab */}
          <TabsContent value="remove" className="space-y-6">
            {/* Search and Filter Card */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <CardTitle>Search & Filter</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by file name or uploaded by..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Tax Year Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="filterTaxYear" className="text-sm">Tax Year</Label>
                      <select
                        id="filterTaxYear"
                        value={filterTaxYear}
                        onChange={(e) => setFilterTaxYear(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="all">All Years</option>
                        {getUniqueTaxYears().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Service Type Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="filterServiceType" className="text-sm">Service Type</Label>
                      <select
                        id="filterServiceType"
                        value={filterServiceType}
                        onChange={(e) => setFilterServiceType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="all">All Service Types</option>
                        <option value="PEO">PEO</option>
                        <option value="ASO">ASO</option>
                      </select>
                    </div>

                    {/* File Type Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="filterFileType" className="text-sm">File Type</Label>
                      <select
                        id="filterFileType"
                        value={filterFileType}
                        onChange={(e) => setFilterFileType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="all">All File Types</option>
                        <option value="SOLV">SOLV</option>
                        <option value="CSV">CSV</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="space-y-2">
                      <Label className="text-sm invisible">Actions</Label>
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{getFilteredFiles().length}</span> of{' '}
                    <span className="font-medium">{w2Files.length}</span> files
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files Table */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Manage W-2 Files</CardTitle>
                <CardDescription>
                  View and remove uploaded W-2 files. Files can be downloaded before removal.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {getFilteredFiles().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tax Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredFiles().map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{file.taxYear}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                file.serviceType === 'PEO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {file.serviceType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                file.fileType === 'SOLV' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {file.fileType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{file.uploadDate}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{file.uploadedBy}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{file.employeeCount}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{file.fileSize}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {file.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => alert(`Downloading ${file.fileName}...`)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteClick(file)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    {w2Files.length === 0 ? (
                      <p className="text-sm">No W-2 files uploaded yet</p>
                    ) : (
                      <div>
                        <p className="text-sm mb-2">No files match your search criteria</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning Info */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900 mb-1">Important Notice</h4>
                    <p className="text-sm text-yellow-800">
                      Removing W-2 files will permanently delete them from the system. Employee records will not be affected, 
                      but the associated W-2 documents will no longer be accessible. Please download files before removal if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg">Delete W-2 File</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to delete <span className="font-semibold">"{fileToDelete?.fileName}"</span>?
              </p>
              <div className="mt-3 p-3 bg-gray-50 border rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Tax Year:</strong> {fileToDelete?.taxYear}<br />
                  <strong>Service Type:</strong> {fileToDelete?.serviceType}<br />
                  <strong>File Type:</strong> {fileToDelete?.fileType}<br />
                  <strong>Employees:</strong> {fileToDelete?.employeeCount}<br />
                  <strong>Uploaded:</strong> {fileToDelete?.uploadDate}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                This will permanently remove the W-2 file from the system. Employee records will remain unchanged.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setFileToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

