'use client';

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EditableTable } from "@/components/ui/editable-table"
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import { FileText, Upload, Plus, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Description as DescriptionIcon,
  Work as WorkIcon,
  Label as LabelIcon,
  VideoLibrary as VideoLibraryIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from '@mui/icons-material'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function ResourceAdminPage() {
  const { user } = useSupabase()
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin'
  } : {
    name: 'Admin User',
    role: 'admin'
  }
  const [activeTab, setActiveTab] = useState('resource');
  
  // Documents state
  const [documents, setDocuments] = useState([]);
  
  // Document categories state with sample documents
  const [documentCategories, setDocumentCategories] = useState([
    { 
      id: 'general', 
      name: 'General Information', 
      icon: 'Description',
      documents: [
        { id: 'doc1', name: '360 Employee Access', url: '#' },
        { id: 'doc2', name: 'Payplus Support', url: '#' },
        { id: 'doc3', name: 'Sundial Integration Doc', url: '#' }
      ]
    },
    { 
      id: 'employment', 
      name: 'Employment Information', 
      icon: 'Work',
      documents: [] 
    },
    { 
      id: 'admin', 
      name: 'Admin Label', 
      icon: 'Label',
      documents: [] 
    },
    { 
      id: 'video', 
      name: 'Video Links', 
      icon: 'VideoLibrary',
      documents: [] 
    },
    { 
      id: 'enrollment', 
      name: 'Open Enrollment', 
      icon: 'EventNote',
      documents: [] 
    },
    { 
      id: 'client', 
      name: 'Client Specific', 
      icon: 'Person',
      documents: [] 
    },
    { 
      id: 'driver', 
      name: 'Driver', 
      icon: 'DirectionsCar',
      documents: [] 
    },
  ]);

  // State for dialogs
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState('');
  
  const [newCategory, setNewCategory] = useState({
    displayLabel: '',
    adminLabel: '',
    icon: 'Folder'
  });
  
  const [documentForm, setDocumentForm] = useState({
    adminLabel: '',
    displayLabel: '',
    type: 'HTML Text',
    file: null,
    instructions: '',
    menuAccess: ''
  });
  
  const documentTypes = [
    'HTML Text',
    'PDF document',
    'External link',
    'Contact info'
  ];
  
  const menuAccessOptions = [
    'All Users',
    'Admin Only',
    'Managers',
    'Standard Users'
  ];
  
  const [filePreview, setFilePreview] = useState(null);

  // Handle saving document
  const handleSaveDocument = () => {
    if (!documentForm.adminLabel.trim() || !documentForm.displayLabel.trim()) return;

    setDocumentCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id !== currentCategoryId) return category;

        const documentData = {
          id: editingDocument || `doc${Date.now()}`,
          adminLabel: documentForm.adminLabel,
          displayLabel: documentForm.displayLabel,
          type: documentForm.type,
          instructions: documentForm.instructions,
          menuAccess: documentForm.menuAccess,
          file: documentForm.file,
          lastUpdated: new Date().toISOString()
        };

        const updatedDocuments = editingDocument
          ? category.documents.map(doc => 
              doc.id === editingDocument ? documentData : doc
            )
          : [...category.documents, documentData];

        return {
          ...category,
          documents: updatedDocuments
        };
      });
    });

    setIsDocumentDialogOpen(false);
    setDocumentForm({
      adminLabel: '',
      displayLabel: '',
      type: 'HTML Text',
      file: null,
      instructions: '',
      menuAccess: ''
    });
    setEditingDocument(null);
  };

  // Available icons for selection
  const availableIcons = [
    { value: 'Description', label: 'Document', icon: <DescriptionIcon className="h-5 w-5" /> },
    { value: 'Work', label: 'Work', icon: <WorkIcon className="h-5 w-5" /> },
    { value: 'Label', label: 'Label', icon: <LabelIcon className="h-5 w-5" /> },
    { value: 'VideoLibrary', label: 'Video', icon: <VideoLibraryIcon className="h-5 w-5" /> },
    { value: 'EventNote', label: 'Calendar', icon: <EventNoteIcon className="h-5 w-5" /> },
    { value: 'Person', label: 'Person', icon: <PersonIcon className="h-5 w-5" /> },
    { value: 'DirectionsCar', label: 'Car', icon: <DirectionsCarIcon className="h-5 w-5" /> },
    { value: 'Folder', label: 'Folder', icon: <FolderIcon className="h-5 w-5" /> },
  ];

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategory.displayLabel && newCategory.adminLabel) {
      const newCategoryObj = {
        id: newCategory.adminLabel.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.displayLabel,
        icon: newCategory.icon
      };
      
      setDocumentCategories([...documentCategories, newCategoryObj]);
      setNewCategory({ displayLabel: '', adminLabel: '', icon: 'Folder' });
      setIsCategoryDialogOpen(false);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent = {
      'Description': DescriptionIcon,
      'Label': LabelIcon,
      'VideoLibrary': VideoLibraryIcon,
      'EventNote': EventNoteIcon,
      'Person': PersonIcon,
      'DirectionsCar': DirectionsCarIcon,
      'Folder': FolderIcon,
      'Add': AddIcon,
      'AdminPanelSettings': AdminPanelSettings,
      'FileText': FileText,
      'Upload': Upload,
      'Plus': Plus,
      'X': X
    }[iconName] || FolderIcon;
    
    return <IconComponent className="h-5 w-5" />;
  };

  // Handle deleting a document from a category
  const handleDeleteDocument = (categoryId, documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocumentCategories(prevCategories => {
        return prevCategories.map(category => {
          if (category.id !== categoryId) return category;
          
          return {
            ...category,
            documents: category.documents.filter(doc => doc.id !== documentId)
          };
        });
      });
    }
  };

  // Handle opening document dialog
  const handleOpenDocumentDialog = (categoryId, document = null) => {
    setCurrentCategoryId(categoryId);
    if (document) {
      setDocumentForm({
        adminLabel: document.adminLabel || '',
        displayLabel: document.displayLabel || '',
        type: document.type || 'HTML Text',
        file: document.file || null,
        instructions: document.instructions || '',
        menuAccess: document.menuAccess || ''
      });
      setFilePreview(document.file ? {
        name: document.file.name,
        size: document.file.size ? `${(document.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB'
      } : null);
      setEditingDocument(document.id);
    } else {
      setDocumentForm({
        adminLabel: '',
        displayLabel: '',
        type: 'HTML Text',
        file: null,
        instructions: '',
        menuAccess: ''
      });
      setFilePreview(null);
      setEditingDocument(null);
    }
    setIsDocumentDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setFilePreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    setFilePreview(null);
  };

  // Save document
  const saveDocument = (e) => {
    e.preventDefault();
    
    const newDocument = {
      id: editingDocument || Date.now(),
      name: formData.name,
      adminLabel: formData.adminLabel,
      displayLabel: formData.displayLabel,
      type: formData.type,
      instructions: formData.instructions,
      file: formData.file,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (editingDocument) {
      setDocuments(documents.map(doc => 
        doc.id === editingDocument ? newDocument : doc
      ));
    } else {
      setDocuments([...documents, newDocument]);
    }
    
    setIsModalOpen(false);
  };

  // Delete document
  const deleteDocument = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get category name by ID
  const getCategoryName = (id) => {
    const category = documentCategories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown';
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Resource Administration"
          subtitle="Manage resource details and configurations"
          icon={<AdminPanelSettings />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'Resource Admin' },
          ]}
        />

        <Tabs defaultValue="resource" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resource" onClick={() => setActiveTab('resource')}>
              Resource
            </TabsTrigger>
            <TabsTrigger value="properties" onClick={() => setActiveTab('properties')}>
              Properties
            </TabsTrigger>
            <TabsTrigger value="client-config" onClick={() => setActiveTab('client-config')}>
              Client Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Document Categories */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Document Categories</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage document categories and types
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsCategoryDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {documentCategories.map((category) => (
                    <div key={category.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getIconComponent(category.icon)}
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDocumentDialog(category.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Document
                        </Button>
                      </div>
                      <div className="divide-y">
                        {category.documents.length > 0 ? (
                          category.documents.map(doc => (
                            <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center">
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {doc.name}
                              </a>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocumentDialog(category.id, doc);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(category.id, doc.id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No documents added yet
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Document Dialog */}
                <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDocument ? 'Edit Document' : 'Add New Document'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminLabel">Admin Label *</Label>
                        <Input
                          id="adminLabel"
                          value={documentForm.adminLabel}
                          onChange={(e) => 
                            setDocumentForm({...documentForm, adminLabel: e.target.value})
                          }
                          placeholder="Enter admin label"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="displayLabel">Display Label *</Label>
                        <Input
                          id="displayLabel"
                          value={documentForm.displayLabel}
                          onChange={(e) => 
                            setDocumentForm({...documentForm, displayLabel: e.target.value})
                          }
                          placeholder="Enter display label"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="documentType">Type</Label>
                        <Select
                          value={documentForm.type}
                          onValueChange={(value) => 
                            setDocumentForm({...documentForm, type: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="documentImage"
                          />
                          <Label 
                            htmlFor="documentImage" 
                            className="cursor-pointer border border-dashed rounded-md p-2 flex-1 text-center hover:bg-gray-50"
                          >
                            {filePreview ? (
                              <div className="flex items-center justify-between">
                                <span>{filePreview.name}</span>
                                <span className="text-sm text-gray-500">{filePreview.size}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-gray-500">
                                <Upload className="h-5 w-5 mb-1" />
                                <span className="text-sm">Click to upload image</span>
                              </div>
                            )}
                          </Label>
                          {filePreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleRemoveFile}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <textarea
                          id="instructions"
                          value={documentForm.instructions}
                          onChange={(e) => 
                            setDocumentForm({...documentForm, instructions: e.target.value})
                          }
                          placeholder="Enter instructions"
                          rows={3}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="menuAccess">Menu Access</Label>
                        <Select
                          value={documentForm.menuAccess}
                          onValueChange={(value) => 
                            setDocumentForm({...documentForm, menuAccess: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select menu access" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuAccessOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDocumentDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveDocument}
                        disabled={!documentForm.adminLabel || !documentForm.displayLabel}
                      >
                        {editingDocument ? 'Save Changes' : 'Add Document'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Latest document updates and changes
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {documents
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, 3)
                    .map(doc => (
                      <div key={doc.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryName(doc.type)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent className="fixed top-[10%] left-1/2 -translate-x-1/2 bg-white rounded-lg p-0 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <DialogHeader className="sticky top-0 bg-white border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-semibold text-gray-900 m-0">
                      Add New Category
                    </DialogTitle>
                    <DialogPrimitive.Close className="text-gray-400 hover:text-gray-500 transition-colors">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                </DialogHeader>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayLabel" className="text-sm font-medium">Display Group Label</Label>
                    <Input
                      id="displayLabel"
                      value={newCategory.displayLabel}
                      onChange={(e) => 
                        setNewCategory({ ...newCategory, displayLabel: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adminLabel" className="text-sm font-medium">Admin Group Label</Label>
                      <span className="text-xs text-gray-500">
                        {newCategory.adminLabel ? 
                          `${newCategory.adminLabel.length} characters` : 
                          '0 characters'}
                      </span>
                    </div>
                    <Input
                      id="adminLabel"
                      value={newCategory.adminLabel}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setNewCategory({ ...newCategory, adminLabel: value });
                      }}
                      className="w-full font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use lowercase letters, numbers, and underscores only
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Icon</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, icon: icon.value })}
                          className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                            newCategory.icon === icon.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <span className={`mb-1 ${newCategory.icon === icon.value ? 'text-blue-600' : 'text-gray-600'}`}>
                            {icon.icon}
                          </span>
                          <span className="text-xs text-gray-600">{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setIsCategoryDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategory.displayLabel || !newCategory.adminLabel}
                    className="px-8"
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
