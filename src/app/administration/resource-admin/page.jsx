"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EditableTable } from "@/components/ui/editable-table";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import {
  FileText,
  Upload,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Description as DescriptionIcon,
  Work as WorkIcon,
  Label as LabelIcon,
  VideoLibrary as VideoLibraryIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Add as AddIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { useSupabase } from "@/contexts/SupabaseContext";
import { supabase } from "@/lib/supabase";

export default function ResourceAdminPage() {
  const { user } = useSupabase();
  const currentUser = user
    ? {
        name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Admin User",
        role: "admin",
      }
    : {
        name: "Admin User",
        role: "admin",
      };
  const [activeTab, setActiveTab] = useState("resource");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([]);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState({});

  // Properties/Record Types state
  const [recordTypes, setRecordTypes] = useState([
    {
      id: 1,
      enabled: false,
      propertyName: "Unpublished",
      description: "Documents and resources not yet published",
      clientUsage: 3,
    },
    {
      id: 2,
      enabled: true,
      propertyName: "Office fixtures",
      description: "Office equipment and fixture management",
      clientUsage: 8,
    },
    {
      id: 3,
      enabled: true,
      propertyName: "Blueberry pickers",
      description: "Seasonal blueberry picker records and documentation",
      clientUsage: 12,
    },
    {
      id: 4,
      enabled: true,
      propertyName: "User generic handbook",
      description: "General user handbook and guidelines",
      clientUsage: 25,
    },
    {
      id: 5,
      enabled: true,
      propertyName: "Driver issue form",
      description: "Driver incident and issue reporting forms",
      clientUsage: 7,
    },
  ]);

  // Document categories state - initially empty, will be populated from Supabase
  const [documentCategories, setDocumentCategories] = useState([]);

  // State for dialogs
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] =
    useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const [newCategory, setNewCategory] = useState({
    displayLabel: "",
    adminLabel: "",
    icon: "Folder",
  });

  const [documentForm, setDocumentForm] = useState({
    adminLabel: "",
    displayLabel: "",
    type: "html_text",
    instructions: "",
    menuAccess: "",
    // HTML Text fields
    imageFile: null,
    imageUrl: "",
    imageInputType: "upload", // 'upload' or 'url'
    // PDF Document fields
    pdfFile: null,
    pdfUrl: "",
    pdfInputType: "upload",
    // External Link fields
    externalUrl: "",
    externalImageFile: null,
    externalImageUrl: "",
    externalImageInputType: "upload",
    // Contact Info fields
    profilePicFile: null,
    profilePicUrl: "",
    profilePicInputType: "upload",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [propertyForm, setPropertyForm] = useState({
    propertyName: "",
    description: "",
    enabled: true,
  });

  const documentTypes = [
    { value: "html_text", label: "HTML Text" },
    { value: "pdf_document", label: "PDF Document" },
    { value: "external_link", label: "External Link" },
    { value: "contact_info", label: "Contact Info" },
  ];

  const menuAccessOptions = [
    "All Users",
    "Admin Only",
    "Managers",
    "Standard Users",
  ];

  const [filePreview, setFilePreview] = useState(null);

  // Fetch all categories and their documents from Supabase
  const fetchResourceData = async () => {
    try {
      setLoading(true);

      // Fetch all resource groups (categories)
      const { data: groups, error: groupsError } = await supabase
        .from("resource_groups")
        .select("*")
        .order("display_label", { ascending: true });

      if (groupsError) {
        console.error("Error fetching resource groups:", groupsError);
        return;
      }

      // Fetch all resource items (documents)
      const { data: items, error: itemsError } = await supabase
        .from("resource_items")
        .select("*")
        .order("display_label", { ascending: true });

      if (itemsError) {
        console.error("Error fetching resource items:", itemsError);
        return;
      }

      // Transform the data to match the component's structure
      const categoriesWithDocuments = groups.map((group) => {
        // Find all documents that belong to this category
        const categoryDocuments = items
          .filter((item) => item.group_id === group.group_id)
          .map((item) => ({
            id: item.resource_id,
            adminLabel: item.admin_label,
            displayLabel: item.display_label,
            type: item.resource_type || "html_text",
            instructions: item.instructions || "",
            details: item.details || {},
            menuAccess: item.menu_access || "",
            lastUpdated: item.updated_at || item.created_at,
          }));

        return {
          id: group.group_id,
          name: group.display_label,
          adminLabel: group.admin_label,
          icon: group.icon_class || "Folder",
          documents: categoryDocuments,
        };
      });

      setDocumentCategories(categoriesWithDocuments);

      // Set all categories as expanded by default
      const expandedState = {};
      categoriesWithDocuments.forEach((cat) => {
        expandedState[cat.id] = true;
      });
      setExpandedCategories(expandedState);
    } catch (error) {
      console.error("Error in fetchResourceData:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchResourceData();
  }, []);

  // Helper function to upload file to Supabase Storage
  const uploadFileToStorage = async (file, folder = "resource_files") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("resources").getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle saving document
  const handleSaveDocument = async () => {
    if (!documentForm.adminLabel.trim() || !documentForm.displayLabel.trim())
      return;

    try {
      setSaving(true);

      // Build details object based on resource type
      let details = {};

      switch (documentForm.type) {
        case "html_text": {
          // Get image URL (either uploaded or pasted)
          let imageUrl = "";
          if (
            documentForm.imageInputType === "upload" &&
            documentForm.imageFile
          ) {
            imageUrl = await uploadFileToStorage(
              documentForm.imageFile,
              "images"
            );
          } else if (
            documentForm.imageInputType === "url" &&
            documentForm.imageUrl
          ) {
            imageUrl = documentForm.imageUrl;
          }
          details = { image_url: imageUrl };
          break;
        }

        case "pdf_document": {
          // Get PDF URL (either uploaded or pasted)
          let pdfUrl = "";
          if (documentForm.pdfInputType === "upload" && documentForm.pdfFile) {
            pdfUrl = await uploadFileToStorage(documentForm.pdfFile, "pdfs");
          } else if (
            documentForm.pdfInputType === "url" &&
            documentForm.pdfUrl
          ) {
            pdfUrl = documentForm.pdfUrl;
          }
          details = { pdf_url: pdfUrl };
          break;
        }

        case "external_link": {
          // Get image URL (either uploaded or pasted)
          let imageUrl = "";
          if (
            documentForm.externalImageInputType === "upload" &&
            documentForm.externalImageFile
          ) {
            imageUrl = await uploadFileToStorage(
              documentForm.externalImageFile,
              "images"
            );
          } else if (
            documentForm.externalImageInputType === "url" &&
            documentForm.externalImageUrl
          ) {
            imageUrl = documentForm.externalImageUrl;
          }
          details = {
            url: documentForm.externalUrl,
            image_url: imageUrl,
          };
          break;
        }

        case "contact_info": {
          // Get profile pic URL (either uploaded or pasted)
          let profilePicUrl = "";
          if (
            documentForm.profilePicInputType === "upload" &&
            documentForm.profilePicFile
          ) {
            profilePicUrl = await uploadFileToStorage(
              documentForm.profilePicFile,
              "profile_pics"
            );
          } else if (
            documentForm.profilePicInputType === "url" &&
            documentForm.profilePicUrl
          ) {
            profilePicUrl = documentForm.profilePicUrl;
          }
          details = {
            profile_pic_url: profilePicUrl,
            name: documentForm.contactName,
            email: documentForm.contactEmail,
            phone: documentForm.contactPhone,
          };
          break;
        }
      }

      if (editingDocument) {
        // Update existing document
        // Build update object, removing any undefined values
        const updateData = {
          admin_label: documentForm.adminLabel,
          display_label: documentForm.displayLabel,
          resource_type: documentForm.type,
          instructions: documentForm.instructions || "",
          details: details,
          menu_access: documentForm.menuAccess || null,
        };

        // Remove undefined values to prevent API errors
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        console.log("Updating document with ID:", editingDocument);
        console.log("Update data:", updateData);

        const { data: updateResult, error: updateError } = await supabase
          .from("resource_items")
          .update(updateData)
          .eq("resource_id", editingDocument)
          .select();

        if (updateError) {
          console.error("Error updating document:", updateError);
          console.error(
            "Full error details:",
            JSON.stringify(updateError, null, 2)
          );
          alert(
            `Error updating document: ${
              updateError.message || "Please try again."
            }`
          );
          setSaving(false);
          return;
        }

        console.log("Update successful:", updateResult);
      } else {
        // Create new document
        const { error: insertError } = await supabase
          .from("resource_items")
          .insert([
            {
              group_id: currentCategoryId,
              admin_label: documentForm.adminLabel,
              display_label: documentForm.displayLabel,
              resource_type: documentForm.type,
              instructions: documentForm.instructions,
              details: details,
              menu_access: documentForm.menuAccess,
            },
          ]);

        if (insertError) {
          console.error("Error creating document:", insertError);
          alert("Error creating document. Please try again.");
          setSaving(false);
          return;
        }
      }

      // Refresh data from Supabase
      await fetchResourceData();

      // Close dialog and reset form
      setIsDocumentDialogOpen(false);
      resetDocumentForm();
      setEditingDocument(null);
    } catch (error) {
      console.error("Error in handleSaveDocument:", error);
      alert(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to reset document form
  const resetDocumentForm = () => {
    setDocumentForm({
      adminLabel: "",
      displayLabel: "",
      type: "html_text",
      instructions: "",
      menuAccess: "",
      imageFile: null,
      imageUrl: "",
      imageInputType: "upload",
      pdfFile: null,
      pdfUrl: "",
      pdfInputType: "upload",
      externalUrl: "",
      externalImageFile: null,
      externalImageUrl: "",
      externalImageInputType: "upload",
      profilePicFile: null,
      profilePicUrl: "",
      profilePicInputType: "upload",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    setFilePreview(null);
  };

  // Available icons for selection
  const availableIcons = [
    {
      value: "Description",
      label: "Document",
      icon: <DescriptionIcon className="h-5 w-5" />,
    },
    { value: "Work", label: "Work", icon: <WorkIcon className="h-5 w-5" /> },
    { value: "Label", label: "Label", icon: <LabelIcon className="h-5 w-5" /> },
    {
      value: "VideoLibrary",
      label: "Video",
      icon: <VideoLibraryIcon className="h-5 w-5" />,
    },
    {
      value: "EventNote",
      label: "Calendar",
      icon: <EventNoteIcon className="h-5 w-5" />,
    },
    {
      value: "Person",
      label: "Person",
      icon: <PersonIcon className="h-5 w-5" />,
    },
    {
      value: "DirectionsCar",
      label: "Car",
      icon: <DirectionsCarIcon className="h-5 w-5" />,
    },
    {
      value: "Folder",
      label: "Folder",
      icon: <FolderIcon className="h-5 w-5" />,
    },
  ];

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.displayLabel || !newCategory.adminLabel) return;

    try {
      setSaving(true);

      // Insert new category into Supabase
      const { error: insertError } = await supabase
        .from("resource_groups")
        .insert([
          {
            display_label: newCategory.displayLabel,
            admin_label: newCategory.adminLabel,
            icon_class: newCategory.icon,
          },
        ]);

      if (insertError) {
        console.error("Error creating category:", insertError);
        alert("Error creating category. Please try again.");
        setSaving(false);
        return;
      }

      // Refresh data from Supabase
      await fetchResourceData();

      // Close dialog and reset form
      setNewCategory({ displayLabel: "", adminLabel: "", icon: "Folder" });
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error("Error in handleAddCategory:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent =
      {
        Description: DescriptionIcon,
        Label: LabelIcon,
        VideoLibrary: VideoLibraryIcon,
        EventNote: EventNoteIcon,
        Person: PersonIcon,
        DirectionsCar: DirectionsCarIcon,
        Folder: FolderIcon,
        Add: AddIcon,
        AdminPanelSettings: AdminPanelSettings,
        FileText: FileText,
        Upload: Upload,
        Plus: Plus,
        X: X,
      }[iconName] || FolderIcon;

    return <IconComponent className="h-5 w-5" />;
  };

  // Handle deleting a document from a category (opens confirmation dialog)
  const handleDeleteDocument = (categoryId, documentId, documentLabel) => {
    setDocumentToDelete({ categoryId, documentId, documentLabel });
    setIsDeleteDialogOpen(true);
  };

  // Confirm and execute document deletion
  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setSaving(true);

      // Delete document from Supabase
      const { error: deleteError } = await supabase
        .from("resource_items")
        .delete()
        .eq("resource_id", documentToDelete.documentId);

      if (deleteError) {
        console.error("Error deleting document:", deleteError);
        alert("Error deleting document. Please try again.");
        setSaving(false);
        return;
      }

      // Refresh data from Supabase
      await fetchResourceData();

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error in confirmDeleteDocument:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle opening document dialog
  const handleOpenDocumentDialog = (categoryId, document = null) => {
    setCurrentCategoryId(categoryId);
    if (document) {
      const details = document.details || {};

      // Populate form based on resource type
      const formData = {
        adminLabel: document.adminLabel || "",
        displayLabel: document.displayLabel || "",
        type: document.type || "html_text",
        instructions: document.instructions || "",
        menuAccess: document.menuAccess || "",
        // HTML Text fields
        imageFile: null,
        imageUrl: details.image_url || "",
        imageInputType: details.image_url ? "url" : "upload",
        // PDF Document fields
        pdfFile: null,
        pdfUrl: details.pdf_url || "",
        pdfInputType: details.pdf_url ? "url" : "upload",
        // External Link fields
        externalUrl: details.url || "",
        externalImageFile: null,
        externalImageUrl: details.image_url || "",
        externalImageInputType: details.image_url ? "url" : "upload",
        // Contact Info fields
        profilePicFile: null,
        profilePicUrl: details.profile_pic_url || "",
        profilePicInputType: details.profile_pic_url ? "url" : "upload",
        contactName: details.name || "",
        contactEmail: details.email || "",
        contactPhone: details.phone || "",
      };

      setDocumentForm(formData);
      setEditingDocument(document.id);
    } else {
      resetDocumentForm();
      setEditingDocument(null);
    }
    setIsDocumentDialogOpen(true);
  };

  // Helper function to get display info for a resource based on its type
  const getResourceDisplayInfo = (doc) => {
    const details = doc.details || {};

    switch (doc.type) {
      case "html_text":
        return {
          url: details.image_url || "#",
          badge: "HTML Text",
          showAsLink: true,
        };
      case "pdf_document":
        return {
          url: details.pdf_url || "#",
          badge: "PDF Document",
          showAsLink: true,
        };
      case "external_link":
        return {
          url: details.url || "#",
          badge: "External Link",
          showAsLink: true,
        };
      case "contact_info":
        return {
          url: `mailto:${details.email || ""}`,
          badge: "Contact Info",
          showAsLink: false,
          contactDetails: {
            name: details.name,
            email: details.email,
            phone: details.phone,
            profilePic: details.profile_pic_url,
          },
        };
      default:
        return {
          url: "#",
          badge: doc.type,
          showAsLink: true,
        };
    }
  };

  // Get category name by ID
  const getCategoryName = (id) => {
    const category = documentCategories.find((cat) => cat.id === id);
    return category ? category.name : "Unknown";
  };

  // Property Management Functions
  const togglePropertyEnabled = (propertyId) => {
    setRecordTypes((prevTypes) =>
      prevTypes.map((type) =>
        type.id === propertyId ? { ...type, enabled: !type.enabled } : type
      )
    );
  };

  const handleOpenPropertyDialog = (property = null) => {
    if (property) {
      setPropertyForm({
        propertyName: property.propertyName,
        description: property.description || "",
        enabled: property.enabled,
      });
      setEditingProperty(property.id);
    } else {
      setPropertyForm({
        propertyName: "",
        description: "",
        enabled: true,
      });
      setEditingProperty(null);
    }
    setIsPropertyDialogOpen(true);
  };

  const handleSaveProperty = () => {
    if (!propertyForm.propertyName.trim()) return;

    if (editingProperty) {
      // Update existing property
      setRecordTypes((prevTypes) =>
        prevTypes.map((type) =>
          type.id === editingProperty
            ? {
                ...type,
                propertyName: propertyForm.propertyName,
                description: propertyForm.description,
                enabled: propertyForm.enabled,
              }
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
        clientUsage: 0,
      };
      setRecordTypes((prev) => [...prev, newProperty]);
    }

    setIsPropertyDialogOpen(false);
    setPropertyForm({ propertyName: "", description: "", enabled: true });
    setEditingProperty(null);
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setIsDeletePropertyDialogOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      setRecordTypes((prevTypes) =>
        prevTypes.filter((type) => type.id !== propertyToDelete.id)
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
            { label: "Administration", href: "/administration" },
            { label: "Resource Admin" },
          ]}
        />

        <Tabs defaultValue="resource" className="space-y-6">
          <TabsList>
            <TabsTrigger
              value="resource"
              onClick={() => setActiveTab("resource")}
            >
              Resource
            </TabsTrigger>
            <TabsTrigger
              value="properties"
              onClick={() => setActiveTab("properties")}
            >
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="client-config"
              onClick={() => setActiveTab("client-config")}
            >
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
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : documentCategories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No categories found. Click "Add Category" to create your
                    first category.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {documentCategories.map((category) => (
                      <div
                        key={category.id}
                        className="border rounded-lg overflow-hidden"
                      >
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
                            <h3 className="font-medium text-gray-900">
                              {category.name}
                            </h3>
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
                              category.documents.map((doc) => {
                                const displayInfo = getResourceDisplayInfo(doc);
                                return (
                                  <div
                                    key={doc.id}
                                    className="px-4 py-3 hover:bg-gray-50 flex justify-between items-start"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {displayInfo.showAsLink ? (
                                          <a
                                            href={displayInfo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {doc.displayLabel}
                                          </a>
                                        ) : (
                                          <span className="font-medium text-gray-900">
                                            {doc.displayLabel}
                                          </span>
                                        )}
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                          {displayInfo.badge}
                                        </span>
                                      </div>

                                      {doc.type === "contact_info" &&
                                        displayInfo.contactDetails && (
                                          <div className="mt-2 space-y-1">
                                            {displayInfo.contactDetails
                                              .name && (
                                              <p className="text-sm text-gray-700">
                                                <strong>Name:</strong>{" "}
                                                {
                                                  displayInfo.contactDetails
                                                    .name
                                                }
                                              </p>
                                            )}
                                            {displayInfo.contactDetails
                                              .email && (
                                              <p className="text-sm text-gray-700">
                                                <strong>Email:</strong>{" "}
                                                <a
                                                  href={`mailto:${displayInfo.contactDetails.email}`}
                                                  className="text-blue-600 hover:underline"
                                                >
                                                  {
                                                    displayInfo.contactDetails
                                                      .email
                                                  }
                                                </a>
                                              </p>
                                            )}
                                            {displayInfo.contactDetails
                                              .phone && (
                                              <p className="text-sm text-gray-700">
                                                <strong>Phone:</strong>{" "}
                                                {
                                                  displayInfo.contactDetails
                                                    .phone
                                                }
                                              </p>
                                            )}
                                          </div>
                                        )}

                                      {doc.instructions && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {doc.instructions}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenDocumentDialog(
                                            category.id,
                                            doc
                                          );
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
                                          handleDeleteDocument(
                                            category.id,
                                            doc.id,
                                            doc.displayLabel
                                          );
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })
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
                )}

                {/* Document Dialog */}
                <Dialog
                  open={isDocumentDialogOpen}
                  onOpenChange={setIsDocumentDialogOpen}
                >
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDocument ? "Edit Document" : "Add New Document"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-2">
                        <Label htmlFor="adminLabel">Admin Label *</Label>
                        <Input
                          id="adminLabel"
                          value={documentForm.adminLabel}
                          onChange={(e) =>
                            setDocumentForm({
                              ...documentForm,
                              adminLabel: e.target.value,
                            })
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
                            setDocumentForm({
                              ...documentForm,
                              displayLabel: e.target.value,
                            })
                          }
                          placeholder="Enter display label"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentType">Type *</Label>
                        <Select
                          value={documentForm.type}
                          onValueChange={(value) =>
                            setDocumentForm({ ...documentForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* HTML Text Fields */}
                      {documentForm.type === "html_text" && (
                        <div className="space-y-2 border-t pt-4">
                          <Label>Image</Label>
                          <Tabs
                            value={documentForm.imageInputType}
                            onValueChange={(value) =>
                              setDocumentForm({
                                ...documentForm,
                                imageInputType: value,
                              })
                            }
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="upload">
                                Upload File
                              </TabsTrigger>
                              <TabsTrigger value="url">Paste URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-2">
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setDocumentForm({
                                      ...documentForm,
                                      imageFile: file || null,
                                    });
                                  }}
                                />
                                {documentForm.imageFile && (
                                  <p className="text-sm text-gray-600">
                                    Selected: {documentForm.imageFile.name}
                                  </p>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="url" className="mt-2">
                              <Input
                                value={documentForm.imageUrl}
                                onChange={(e) =>
                                  setDocumentForm({
                                    ...documentForm,
                                    imageUrl: e.target.value,
                                  })
                                }
                                placeholder="https://example.com/image.jpg"
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}

                      {/* PDF Document Fields */}
                      {documentForm.type === "pdf_document" && (
                        <div className="space-y-2 border-t pt-4">
                          <Label>PDF File</Label>
                          <Tabs
                            value={documentForm.pdfInputType}
                            onValueChange={(value) =>
                              setDocumentForm({
                                ...documentForm,
                                pdfInputType: value,
                              })
                            }
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="upload">
                                Upload File
                              </TabsTrigger>
                              <TabsTrigger value="url">Paste URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-2">
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setDocumentForm({
                                      ...documentForm,
                                      pdfFile: file || null,
                                    });
                                  }}
                                />
                                {documentForm.pdfFile && (
                                  <p className="text-sm text-gray-600">
                                    Selected: {documentForm.pdfFile.name}
                                  </p>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="url" className="mt-2">
                              <Input
                                value={documentForm.pdfUrl}
                                onChange={(e) =>
                                  setDocumentForm({
                                    ...documentForm,
                                    pdfUrl: e.target.value,
                                  })
                                }
                                placeholder="https://example.com/document.pdf"
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}

                      {/* External Link Fields */}
                      {documentForm.type === "external_link" && (
                        <>
                          <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="externalUrl">URL *</Label>
                            <Input
                              id="externalUrl"
                              value={documentForm.externalUrl}
                              onChange={(e) =>
                                setDocumentForm({
                                  ...documentForm,
                                  externalUrl: e.target.value,
                                })
                              }
                              placeholder="https://example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Thumbnail Image (Optional)</Label>
                            <Tabs
                              value={documentForm.externalImageInputType}
                              onValueChange={(value) =>
                                setDocumentForm({
                                  ...documentForm,
                                  externalImageInputType: value,
                                })
                              }
                            >
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">
                                  Upload File
                                </TabsTrigger>
                                <TabsTrigger value="url">Paste URL</TabsTrigger>
                              </TabsList>
                              <TabsContent value="upload" className="mt-2">
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      setDocumentForm({
                                        ...documentForm,
                                        externalImageFile: file || null,
                                      });
                                    }}
                                  />
                                  {documentForm.externalImageFile && (
                                    <p className="text-sm text-gray-600">
                                      Selected:{" "}
                                      {documentForm.externalImageFile.name}
                                    </p>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="url" className="mt-2">
                                <Input
                                  value={documentForm.externalImageUrl}
                                  onChange={(e) =>
                                    setDocumentForm({
                                      ...documentForm,
                                      externalImageUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://example.com/image.jpg"
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        </>
                      )}

                      {/* Contact Info Fields */}
                      {documentForm.type === "contact_info" && (
                        <>
                          <div className="space-y-2 border-t pt-4">
                            <Label>Profile Picture (Optional)</Label>
                            <Tabs
                              value={documentForm.profilePicInputType}
                              onValueChange={(value) =>
                                setDocumentForm({
                                  ...documentForm,
                                  profilePicInputType: value,
                                })
                              }
                            >
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">
                                  Upload File
                                </TabsTrigger>
                                <TabsTrigger value="url">Paste URL</TabsTrigger>
                              </TabsList>
                              <TabsContent value="upload" className="mt-2">
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      setDocumentForm({
                                        ...documentForm,
                                        profilePicFile: file || null,
                                      });
                                    }}
                                  />
                                  {documentForm.profilePicFile && (
                                    <p className="text-sm text-gray-600">
                                      Selected:{" "}
                                      {documentForm.profilePicFile.name}
                                    </p>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="url" className="mt-2">
                                <Input
                                  value={documentForm.profilePicUrl}
                                  onChange={(e) =>
                                    setDocumentForm({
                                      ...documentForm,
                                      profilePicUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://example.com/profile.jpg"
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactName">Name</Label>
                            <Input
                              id="contactName"
                              value={documentForm.contactName}
                              onChange={(e) =>
                                setDocumentForm({
                                  ...documentForm,
                                  contactName: e.target.value,
                                })
                              }
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email Address</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              value={documentForm.contactEmail}
                              onChange={(e) =>
                                setDocumentForm({
                                  ...documentForm,
                                  contactEmail: e.target.value,
                                })
                              }
                              placeholder="john@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Phone Number</Label>
                            <Input
                              id="contactPhone"
                              type="tel"
                              value={documentForm.contactPhone}
                              onChange={(e) =>
                                setDocumentForm({
                                  ...documentForm,
                                  contactPhone: e.target.value,
                                })
                              }
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </>
                      )}

                      {/* Common Instructions Field */}
                      <div className="space-y-2 border-t pt-4">
                        <Label htmlFor="instructions">Instructions</Label>
                        <textarea
                          id="instructions"
                          value={documentForm.instructions}
                          onChange={(e) =>
                            setDocumentForm({
                              ...documentForm,
                              instructions: e.target.value,
                            })
                          }
                          placeholder="Enter instructions or additional notes"
                          rows={3}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="menuAccess">Menu Access</Label>
                        <Select
                          value={documentForm.menuAccess}
                          onValueChange={(value) =>
                            setDocumentForm({
                              ...documentForm,
                              menuAccess: value,
                            })
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
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveDocument}
                        disabled={
                          !documentForm.adminLabel ||
                          !documentForm.displayLabel ||
                          saving
                        }
                      >
                        {saving && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {editingDocument ? "Save Changes" : "Add Document"}
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
                    .sort(
                      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                    )
                    .slice(0, 3)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Updated{" "}
                            {new Date(doc.updatedAt).toLocaleDateString()}
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
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
            >
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
                    <Label
                      htmlFor="displayLabel"
                      className="text-sm font-medium"
                    >
                      Display Group Label
                    </Label>
                    <Input
                      id="displayLabel"
                      value={newCategory.displayLabel}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          displayLabel: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="adminLabel"
                        className="text-sm font-medium"
                      >
                        Admin Group Label
                      </Label>
                      <span className="text-xs text-gray-500">
                        {newCategory.adminLabel
                          ? `${newCategory.adminLabel.length} characters`
                          : "0 characters"}
                      </span>
                    </div>
                    <Input
                      id="adminLabel"
                      value={newCategory.adminLabel}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "");
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
                          onClick={() =>
                            setNewCategory({ ...newCategory, icon: icon.value })
                          }
                          className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                            newCategory.icon === icon.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          } transition-colors`}
                        >
                          <span
                            className={`mb-1 ${
                              newCategory.icon === icon.value
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          >
                            {icon.icon}
                          </span>
                          <span className="text-xs text-gray-600">
                            {icon.label}
                          </span>
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
                    disabled={saving}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={
                      !newCategory.displayLabel ||
                      !newCategory.adminLabel ||
                      saving
                    }
                    className="px-8"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">
                        Delete Document
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      "{documentToDelete?.documentLabel}"
                    </span>
                    ?
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
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteDocument}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
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
                              onCheckedChange={() =>
                                togglePropertyEnabled(property.id)
                              }
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
                                {property.clientUsage === 1
                                  ? "client"
                                  : "clients"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOpenPropertyDialog(property)
                                }
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
                      No record types found. Click "Add Record Type" to create
                      one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Dialog */}
            <Dialog
              open={isPropertyDialogOpen}
              onOpenChange={setIsPropertyDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProperty
                      ? "Edit Record Type"
                      : "Add New Record Type"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProperty
                      ? "Update the record type details below."
                      : "Create a new record type for property management."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyName">Property Name *</Label>
                    <Input
                      id="propertyName"
                      value={propertyForm.propertyName}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          propertyName: e.target.value,
                        })
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
                        setPropertyForm({
                          ...propertyForm,
                          description: e.target.value,
                        })
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
                        setPropertyForm({ ...propertyForm, enabled: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPropertyDialogOpen(false);
                      setPropertyForm({
                        propertyName: "",
                        description: "",
                        enabled: true,
                      });
                      setEditingProperty(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProperty}
                    disabled={!propertyForm.propertyName.trim()}
                  >
                    {editingProperty ? "Save Changes" : "Add Record Type"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Property Confirmation Dialog */}
            <Dialog
              open={isDeletePropertyDialogOpen}
              onOpenChange={setIsDeletePropertyDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">
                        Delete Record Type
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      "{propertyToDelete?.propertyName}"
                    </span>
                    ?
                  </p>
                  {propertyToDelete && propertyToDelete.clientUsage > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This record type is currently
                        being used by {propertyToDelete.clientUsage}{" "}
                        {propertyToDelete.clientUsage === 1
                          ? "client"
                          : "clients"}
                        .
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently remove the record type from the
                    system.
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
                <p className="text-gray-500">
                  Client Configuration section coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
