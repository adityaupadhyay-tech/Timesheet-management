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
import { FileText, Upload, Plus, X, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  
  // Expanded categories state (all expanded by default)
  const [expandedCategories, setExpandedCategories] = useState({
    general: true,
    employment: true,
    admin: true,
    video: true,
    enrollment: true,
    client: true,
    driver: true,
  });

  // Properties/Record Types state
  const [recordTypes, setRecordTypes] = useState([
    { id: 1, enabled: false, propertyName: 'Unpublished', description: 'Documents and resources not yet published', clientUsage: 3 },
    { id: 2, enabled: true, propertyName: 'Office fixtures', description: 'Office equipment and fixture management', clientUsage: 8 },
    { id: 3, enabled: true, propertyName: 'Blueberry pickers', description: 'Seasonal blueberry picker records and documentation', clientUsage: 12 },
    { id: 4, enabled: true, propertyName: 'User generic handbook', description: 'General user handbook and guidelines', clientUsage: 25 },
    { id: 5, enabled: true, propertyName: 'Driver issue form', description: 'Driver incident and issue reporting forms', clientUsage: 7 },
  ]);
  
  // Document categories state with sample documents
  const [documentCategories, setDocumentCategories] = useState([
    { 
      id: 'general', 
      name: 'General Information', 
      icon: 'Description',
      documents: [
        { 
          id: 'doc1', 
          adminLabel: '360_employee_access',
          displayLabel: '360 Employee Access',
          type: 'External link',
          instructions: 'Link to access 360 employee portal',
          menuAccess: 'All Users',
          file: null,
          url: '#',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: 'doc2', 
          adminLabel: 'payplus_support',
          displayLabel: 'Payplus Support',
          type: 'External link',
          instructions: 'Support documentation for Payplus system',
          menuAccess: 'All Users',
          file: null,
          url: '#',
          lastUpdated: new Date().toISOString()
        },
        { 
          id: 'doc3', 
          adminLabel: 'sundial_integration',
          displayLabel: 'Sundial Integration Doc',
          type: 'PDF document',
          instructions: 'Integration guide for Sundial time tracking',
          menuAccess: 'Admin Only',
          file: null,
          url: '#',
          lastUpdated: new Date().toISOString()
        }
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState('');
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  
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

  const [propertyForm, setPropertyForm] = useState({
    propertyName: '',
    description: '',
    enabled: true
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

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategory.displayLabel && newCategory.adminLabel) {
      const newCategoryId = newCategory.adminLabel.toLowerCase().replace(/\s+/g, '-');
      const newCategoryObj = {
        id: newCategoryId,
        name: newCategory.displayLabel,
        icon: newCategory.icon,
        documents: []
      };
      
      setDocumentCategories([...documentCategories, newCategoryObj]);
      setExpandedCategories(prev => ({
        ...prev,
        [newCategoryId]: true
      }));
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

  // Handle deleting a document from a category (opens confirmation dialog)
  const handleDeleteDocument = (categoryId, documentId, documentLabel) => {
    setDocumentToDelete({ categoryId, documentId, documentLabel });
    setIsDeleteDialogOpen(true);
  };

  // Confirm and execute document deletion
  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      setDocumentCategories(prevCategories => {
        return prevCategories.map(category => {
          if (category.id !== documentToDelete.categoryId) return category;
          
          return {
            ...category,
            documents: category.documents.filter(doc => doc.id !== documentToDelete.documentId)
          };
        });
      });
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
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

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentForm(prev => ({
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
    setDocumentForm(prev => ({
      ...prev,
      file: null
    }));
    setFilePreview(null);
  };

  // Get category name by ID
  const getCategoryName = (id) => {
    const category = documentCategories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown';
  };

  // Property Management Functions
  const togglePropertyEnabled = (propertyId) => {
    setRecordTypes(prevTypes => 
      prevTypes.map(type => 
        type.id === propertyId ? { ...type, enabled: !type.enabled } : type
      )
    );
  };

  const handleOpenPropertyDialog = (property = null) => {
    if (property) {
      setPropertyForm({
        propertyName: property.propertyName,
        description: property.description || '',
        enabled: property.enabled
      });
      setEditingProperty(property.id);
    } else {
      setPropertyForm({
        propertyName: '',
        description: '',
        enabled: true
      });
      setEditingProperty(null);
    }
    setIsPropertyDialogOpen(true);
  };

  const handleSaveProperty = () => {
    if (!propertyForm.propertyName.trim()) return;

    if (editingProperty) {
      // Update existing property
      setRecordTypes(prevTypes =>
        prevTypes.map(type =>
          type.id === editingProperty
            ? { ...type, propertyName: propertyForm.propertyName, description: propertyForm.description, enabled: propertyForm.enabled }
            : type
        )
      );
    } else {
      // Add new property
      const newProperty = {
        id: Date.now(),
        propertyName: propertyForm.propertyName,
        description: propertyForm.description,
        enabled: propertyForm.enabled,
        clientUsage: 0
      };
      setRecordTypes(prev => [...prev, newProperty]);
    }

    setIsPropertyDialogOpen(false);
    setPropertyForm({ propertyName: '', description: '', enabled: true });
    setEditingProperty(null);
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setIsDeletePropertyDialogOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      setRecordTypes(prevTypes => 
        prevTypes.filter(type => type.id !== propertyToDelete.id)
      );
      setIsDeletePropertyDialogOpen(false);
      setPropertyToDelete(null);
    }
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

          <TabsContent value="resource" className="space-y-6">
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
                      <div 
                        className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center space-x-2">
                          {expandedCategories[category.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                          {getIconComponent(category.icon)}
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <span className="text-sm text-gray-500">
                            ({category.documents?.length || 0})
                          </span>
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
                      {expandedCategories[category.id] && (
                        <div className="divide-y">
                          {category.documents.length > 0 ? (
                            category.documents.map(doc => (
                              <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={doc.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {doc.displayLabel || doc.name}
                                    </a>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {doc.type}
                                    </span>
                                  </div>
                                  {doc.instructions && (
                                    <p className="text-sm text-gray-600 mt-1">{doc.instructions}</p>
                                  )}
                                </div>
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
                                    handleDeleteDocument(category.id, doc.id, doc.displayLabel || doc.name);
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
                      )}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">Delete Document</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete <span className="font-semibold">"{documentToDelete?.documentLabel}"</span>?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently remove the document from the system.
                  </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setDocumentToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={confirmDeleteDocument}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Document
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Record Types</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage property record types and their settings
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenPropertyDialog()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Record Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Enabled
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Client Usage
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recordTypes.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Switch
                              checked={property.enabled}
                              onCheckedChange={() => togglePropertyEnabled(property.id)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.propertyName}
                            </div>
                            {property.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {property.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900">
                                {property.clientUsage}
                              </span>
                              <span className="text-xs text-gray-500">
                                {property.clientUsage === 1 ? 'client' : 'clients'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenPropertyDialog(property)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteProperty(property)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recordTypes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No record types found. Click "Add Record Type" to create one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Dialog */}
            <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProperty ? 'Edit Record Type' : 'Add New Record Type'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProperty 
                      ? 'Update the record type details below.' 
                      : 'Create a new record type for property management.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyName">Property Name *</Label>
                    <Input
                      id="propertyName"
                      value={propertyForm.propertyName}
                      onChange={(e) => 
                        setPropertyForm({...propertyForm, propertyName: e.target.value})
                      }
                      placeholder="Enter property name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={propertyForm.description}
                      onChange={(e) => 
                        setPropertyForm({...propertyForm, description: e.target.value})
                      }
                      placeholder="Enter a brief description of this record type"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enabled">Enabled</Label>
                      <p className="text-sm text-gray-500">
                        Enable or disable this record type
                      </p>
                    </div>
                    <Switch
                      id="enabled"
                      checked={propertyForm.enabled}
                      onCheckedChange={(checked) => 
                        setPropertyForm({...propertyForm, enabled: checked})
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsPropertyDialogOpen(false);
                      setPropertyForm({ propertyName: '', description: '', enabled: true });
                      setEditingProperty(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProperty}
                    disabled={!propertyForm.propertyName.trim()}
                  >
                    {editingProperty ? 'Save Changes' : 'Add Record Type'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Property Confirmation Dialog */}
            <Dialog open={isDeletePropertyDialogOpen} onOpenChange={setIsDeletePropertyDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">Delete Record Type</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete <span className="font-semibold">"{propertyToDelete?.propertyName}"</span>?
                  </p>
                  {propertyToDelete && propertyToDelete.clientUsage > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This record type is currently being used by {propertyToDelete.clientUsage} {propertyToDelete.clientUsage === 1 ? 'client' : 'clients'}.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently remove the record type from the system.
                  </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeletePropertyDialogOpen(false);
                      setPropertyToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={confirmDeleteProperty}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Record Type
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Client Configuration Tab */}
          <TabsContent value="client-config" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Client Configuration section coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
