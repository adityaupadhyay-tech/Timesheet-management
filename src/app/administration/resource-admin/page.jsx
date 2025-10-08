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
  const [recordTypes, setRecordTypes] = useState([]);

  // Document categories state - initially empty, will be populated from Supabase
  const [documentCategories, setDocumentCategories] = useState([]);

  // State for dialogs
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] =
    useState(false);
  const [isResourceUsageModalOpen, setIsResourceUsageModalOpen] =
    useState(false);
  const [isClientUsageModalOpen, setIsClientUsageModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [selectedPropertyForUsage, setSelectedPropertyForUsage] =
    useState(null);
  const [resourcesUsingProperty, setResourcesUsingProperty] = useState([]);
  const [selectedPropertyForClientUsage, setSelectedPropertyForClientUsage] =
    useState(null);
  const [companiesUsingProperty, setCompaniesUsingProperty] = useState([]);

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

  // Properties selection state
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Modal tab state
  const [modalTab, setModalTab] = useState("general");

  // Client Configuration state
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyPropertyStates, setCompanyPropertyStates] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Fetch all properties with usage counts
  const fetchProperties = async () => {
    try {
      // Fetch all properties
      const { data: properties, error: propertiesError } = await supabase
        .from("resource_properties")
        .select("*")
        .order("property_label", { ascending: true });

      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        return;
      }

      // For each property, fetch usage counts
      const propertiesWithCounts = await Promise.all(
        properties.map(async (property) => {
          // Count resource usage
          const { count: resourceCount, error: resourceError } = await supabase
            .from("resource_item_properties")
            .select("*", { count: "exact", head: true })
            .eq("property_id", property.property_id);

          // Count client/company usage
          const { count: clientCount, error: clientError } = await supabase
            .from("resource_company_properties")
            .select("*", { count: "exact", head: true })
            .eq("property_id", property.property_id);

          return {
            id: property.property_id,
            propertyName: property.property_label,
            description: property.description || "",
            enabled: property.is_enabled !== false,
            resourceUsage: resourceError ? 0 : resourceCount || 0,
            clientUsage: clientError ? 0 : clientCount || 0,
          };
        })
      );

      setRecordTypes(propertiesWithCounts);
    } catch (error) {
      console.error("Error in fetchProperties:", error);
    }
  };

  // Fetch companies for client configuration
  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        return;
      }

      setCompanies(companiesData || []);
    } catch (error) {
      console.error("Error in fetchCompanies:", error);
    }
  };

  // Fetch company's property associations
  const fetchCompanyProperties = async (companyId) => {
    try {
      // Fetch all property associations for this company where is_active is true
      const { data: associations, error: associationsError } = await supabase
        .from("resource_company_properties")
        .select("property_id, is_active")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (associationsError) {
        console.error("Error fetching company properties:", associationsError);
        return {};
      }

      // Create a map of property_id -> true for active properties
      const propertyStates = {};
      recordTypes.forEach((property) => {
        const isActive = associations?.some(
          (assoc) => assoc.property_id === property.id
        );
        propertyStates[property.id] = isActive || false;
      });

      return propertyStates;
    } catch (error) {
      console.error("Error in fetchCompanyProperties:", error);
      return {};
    }
  };

  // Handle company selection
  const handleCompanySelect = async (company) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to discard them?"
      );
      if (!confirm) return;
    }

    setSelectedCompany(company);
    setHasUnsavedChanges(false);

    // Fetch and set property states for this company
    const propertyStates = await fetchCompanyProperties(company.id);
    setCompanyPropertyStates(propertyStates);
  };

  // Handle property toggle
  const handlePropertyToggle = (propertyId) => {
    setCompanyPropertyStates((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
    setHasUnsavedChanges(true);
  };

  // Save company property configuration
  const saveCompanyProperties = async () => {
    if (!selectedCompany) return;

    try {
      setSaving(true);

      // Step 1: Delete all existing associations for this company
      const { error: deleteError } = await supabase
        .from("resource_company_properties")
        .delete()
        .eq("company_id", selectedCompany.id);

      if (deleteError) {
        console.error("Error deleting existing associations:", deleteError);
        alert("Error saving configuration. Please try again.");
        setSaving(false);
        return;
      }

      // Step 2: Insert new associations for checked properties
      const activePropertyIds = Object.keys(companyPropertyStates).filter(
        (propertyId) => companyPropertyStates[propertyId] === true
      );

      if (activePropertyIds.length > 0) {
        const insertData = activePropertyIds.map((propertyId) => ({
          company_id: selectedCompany.id,
          property_id: parseInt(propertyId),
          is_active: true,
        }));

        const { error: insertError } = await supabase
          .from("resource_company_properties")
          .insert(insertData);

        if (insertError) {
          console.error("Error inserting new associations:", insertError);
          alert("Error saving configuration. Please try again.");
          setSaving(false);
          return;
        }
      }

      // Refresh properties to update usage counts
      await fetchProperties();

      setHasUnsavedChanges(false);
      alert("Configuration saved successfully!");
    } catch (error) {
      console.error("Error in saveCompanyProperties:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchResourceData();
    fetchProperties();
    fetchCompanies();
  }, []);

  // Helper function to sync property associations (delete-then-insert)
  const syncPropertyAssociations = async (resourceId, propertyIds) => {
    try {
      // Step 1: Delete all existing property associations for this resource
      const { error: deleteError } = await supabase
        .from("resource_item_properties")
        .delete()
        .eq("resource_id", resourceId);

      if (deleteError) {
        console.error("Error deleting existing properties:", deleteError);
        throw deleteError;
      }

      // Step 2: Insert new property associations
      if (propertyIds && propertyIds.length > 0) {
        const insertData = propertyIds.map((propertyId) => ({
          resource_id: resourceId,
          property_id: propertyId,
        }));

        const { error: insertError } = await supabase
          .from("resource_item_properties")
          .insert(insertData);

        if (insertError) {
          console.error("Error inserting new properties:", insertError);
          throw insertError;
        }
      }

      console.log("Property associations synced successfully");
    } catch (error) {
      console.error("Error in syncPropertyAssociations:", error);
      throw error;
    }
  };

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

        // Sync property associations for updated resource
        await syncPropertyAssociations(editingDocument, selectedProperties);
      } else {
        // Create new document
        const { data: insertResult, error: insertError } = await supabase
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
          ])
          .select();

        if (insertError) {
          console.error("Error creating document:", insertError);
          alert("Error creating document. Please try again.");
          setSaving(false);
          return;
        }

        // Sync property associations for newly created resource
        if (insertResult && insertResult[0]) {
          await syncPropertyAssociations(
            insertResult[0].resource_id,
            selectedProperties
          );
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
    setSelectedProperties([]);
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
  const handleOpenDocumentDialog = async (categoryId, document = null) => {
    setCurrentCategoryId(categoryId);
    setModalTab("general"); // Reset to general tab

    // Fetch available properties
    const { data: properties, error: propertiesError } = await supabase
      .from("resource_properties")
      .select("*")
      .eq("is_enabled", true)
      .order("property_label", { ascending: true });

    if (!propertiesError && properties) {
      setAvailableProperties(
        properties.map((p) => ({
          id: p.property_id,
          label: p.property_label,
        }))
      );
    }

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

      // Fetch existing property associations for this resource
      const { data: existingProps, error: existingPropsError } = await supabase
        .from("resource_item_properties")
        .select("property_id")
        .eq("resource_id", document.id);

      if (!existingPropsError && existingProps) {
        setSelectedProperties(existingProps.map((p) => p.property_id));
      } else {
        setSelectedProperties([]);
      }
    } else {
      resetDocumentForm();
      setEditingDocument(null);
      setSelectedProperties([]);
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
  const togglePropertyEnabled = async (propertyId) => {
    try {
      // Find current property to get its current enabled state
      const property = recordTypes.find((type) => type.id === propertyId);
      if (!property) return;

      // Update in database
      const { error } = await supabase
        .from("resource_properties")
        .update({ is_enabled: !property.enabled })
        .eq("property_id", propertyId);

      if (error) {
        console.error("Error toggling property:", error);
        alert("Error updating property status. Please try again.");
        return;
      }

      // Update local state
      setRecordTypes((prevTypes) =>
        prevTypes.map((type) =>
          type.id === propertyId ? { ...type, enabled: !type.enabled } : type
        )
      );
    } catch (error) {
      console.error("Error in togglePropertyEnabled:", error);
      alert("An unexpected error occurred. Please try again.");
    }
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

  const handleSaveProperty = async () => {
    if (!propertyForm.propertyName.trim()) return;

    try {
      setSaving(true);

      // Build data object with proper null handling
      const propertyData = {
        property_label: propertyForm.propertyName.trim(),
        description: propertyForm.description?.trim() || null,
        is_enabled: propertyForm.enabled === true,
      };

      // Remove any undefined values
      Object.keys(propertyData).forEach((key) => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      if (editingProperty) {
        // Update existing property
        console.log("Updating property with ID:", editingProperty);
        console.log("Property data:", propertyData);

        const { error: updateError } = await supabase
          .from("resource_properties")
          .update(propertyData)
          .eq("property_id", editingProperty)
          .select();

        if (updateError) {
          console.error("Error updating property:", updateError);
          console.error("Full error:", JSON.stringify(updateError, null, 2));
          alert(
            `Error updating property: ${
              updateError.message || "Please try again."
            }`
          );
          setSaving(false);
          return;
        }
      } else {
        // Add new property
        console.log("Creating new property with data:", propertyData);

        const { error: insertError } = await supabase
          .from("resource_properties")
          .insert([propertyData])
          .select();

        if (insertError) {
          console.error("Error creating property:", insertError);
          console.error("Full error:", JSON.stringify(insertError, null, 2));
          alert(
            `Error creating property: ${
              insertError.message || "Please try again."
            }`
          );
          setSaving(false);
          return;
        }
      }

      // Refresh properties list
      await fetchProperties();

      setIsPropertyDialogOpen(false);
      setPropertyForm({ propertyName: "", description: "", enabled: true });
      setEditingProperty(null);
    } catch (error) {
      console.error("Error in handleSaveProperty:", error);
      alert(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setIsDeletePropertyDialogOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      setSaving(true);

      // Delete from database (cascading deletes will handle junction tables)
      const { error: deleteError } = await supabase
        .from("resource_properties")
        .delete()
        .eq("property_id", propertyToDelete.id);

      if (deleteError) {
        console.error("Error deleting property:", deleteError);
        alert("Error deleting property. Please try again.");
        setSaving(false);
        return;
      }

      // Refresh properties list
      await fetchProperties();

      setIsDeletePropertyDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Error in confirmDeleteProperty:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle clicking on resource usage count
  const handleResourceUsageClick = async (property) => {
    try {
      setLoading(true);
      setSelectedPropertyForUsage(property);

      // Fetch all resource_ids linked to this property
      const { data: propertyLinks, error: linksError } = await supabase
        .from("resource_item_properties")
        .select("resource_id")
        .eq("property_id", property.id);

      if (linksError) {
        console.error("Error fetching property links:", linksError);
        alert("Error loading resources. Please try again.");
        setLoading(false);
        return;
      }

      // If no resources are using this property
      if (!propertyLinks || propertyLinks.length === 0) {
        setResourcesUsingProperty([]);
        setIsResourceUsageModalOpen(true);
        setLoading(false);
        return;
      }

      // Extract resource IDs
      const resourceIds = propertyLinks.map((link) => link.resource_id);

      // Fetch resource details
      const { data: resources, error: resourcesError } = await supabase
        .from("resource_items")
        .select("resource_id, display_label, admin_label, resource_type")
        .in("resource_id", resourceIds)
        .order("display_label", { ascending: true });

      if (resourcesError) {
        console.error("Error fetching resources:", resourcesError);
        alert("Error loading resource details. Please try again.");
        setLoading(false);
        return;
      }

      setResourcesUsingProperty(resources || []);
      setIsResourceUsageModalOpen(true);
    } catch (error) {
      console.error("Error in handleResourceUsageClick:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on client usage count
  const handleClientUsageClick = async (property) => {
    try {
      setLoading(true);
      setSelectedPropertyForClientUsage(property);

      // Fetch all company_ids linked to this property
      const { data: propertyLinks, error: linksError } = await supabase
        .from("resource_company_properties")
        .select("company_id")
        .eq("property_id", property.id)
        .eq("is_active", true);

      if (linksError) {
        console.error("Error fetching company property links:", linksError);
        alert("Error loading companies. Please try again.");
        setLoading(false);
        return;
      }

      // If no companies are using this property
      if (!propertyLinks || propertyLinks.length === 0) {
        setCompaniesUsingProperty([]);
        setIsClientUsageModalOpen(true);
        setLoading(false);
        return;
      }

      // Extract company IDs
      const companyIds = propertyLinks.map((link) => link.company_id);

      // Fetch company details
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, description, status")
        .in("id", companyIds)
        .order("name", { ascending: true });

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        alert("Error loading company details. Please try again.");
        setLoading(false);
        return;
      }

      setCompaniesUsingProperty(companies || []);
      setIsClientUsageModalOpen(true);
    } catch (error) {
      console.error("Error in handleClientUsageClick:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDocument ? "Edit Resource" : "Add New Resource"}
                      </DialogTitle>
                    </DialogHeader>

                    {/* Tabs for General Settings and Properties */}
                    <Tabs
                      value={modalTab}
                      onValueChange={setModalTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">
                          General Settings
                        </TabsTrigger>
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                      </TabsList>

                      {/* General Settings Tab */}
                      <TabsContent value="general" className="mt-4">
                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
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
                            <Label htmlFor="displayLabel">
                              Display Label *
                            </Label>
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
                                setDocumentForm({
                                  ...documentForm,
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
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
                                  <TabsTrigger value="url">
                                    Paste URL
                                  </TabsTrigger>
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
                                  <TabsTrigger value="url">
                                    Paste URL
                                  </TabsTrigger>
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
                                    <TabsTrigger value="url">
                                      Paste URL
                                    </TabsTrigger>
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
                                    <TabsTrigger value="url">
                                      Paste URL
                                    </TabsTrigger>
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
                                <Label htmlFor="contactEmail">
                                  Email Address
                                </Label>
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
                                <Label htmlFor="contactPhone">
                                  Phone Number
                                </Label>
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
                      </TabsContent>

                      {/* Properties Tab */}
                      <TabsContent value="properties" className="mt-4">
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                          <div>
                            <Label className="text-base font-semibold">
                              Properties / Tags
                            </Label>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                              Select properties to associate with this resource.
                              These help categorize and filter resources.
                            </p>
                          </div>

                          {availableProperties.length > 0 ? (
                            <div className="space-y-3 border rounded-lg p-4">
                              {availableProperties.map((property) => (
                                <div
                                  key={property.id}
                                  className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    id={`property-${property.id}`}
                                    checked={selectedProperties.includes(
                                      property.id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProperties([
                                          ...selectedProperties,
                                          property.id,
                                        ]);
                                      } else {
                                        setSelectedProperties(
                                          selectedProperties.filter(
                                            (id) => id !== property.id
                                          )
                                        );
                                      }
                                    }}
                                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                  />
                                  <Label
                                    htmlFor={`property-${property.id}`}
                                    className="text-sm font-medium cursor-pointer flex-1"
                                  >
                                    {property.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                              <p className="text-sm text-gray-500 mb-2">
                                No properties available
                              </p>
                              <p className="text-xs text-gray-400">
                                Create properties in the Properties tab first,
                                then come back here to assign them.
                              </p>
                            </div>
                          )}

                          {selectedProperties.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-900">
                                <strong>{selectedProperties.length}</strong>{" "}
                                {selectedProperties.length === 1
                                  ? "property"
                                  : "properties"}{" "}
                                selected
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Resource Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
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
                            <button
                              onClick={() => handleResourceUsageClick(property)}
                              disabled={
                                !property.resourceUsage ||
                                property.resourceUsage === 0
                              }
                              className={`flex items-center gap-2 ${
                                property.resourceUsage > 0
                                  ? "cursor-pointer hover:text-blue-600 transition-colors"
                                  : "cursor-default"
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  property.resourceUsage > 0
                                    ? "text-blue-600 underline"
                                    : "text-gray-900"
                                }`}
                              >
                                {property.resourceUsage || 0}
                              </span>
                              <span className="text-xs text-gray-500">
                                {property.resourceUsage === 1
                                  ? "resource"
                                  : "resources"}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleClientUsageClick(property)}
                              disabled={
                                !property.clientUsage ||
                                property.clientUsage === 0
                              }
                              className={`flex items-center gap-2 ${
                                property.clientUsage > 0
                                  ? "cursor-pointer hover:text-blue-600 transition-colors"
                                  : "cursor-default"
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  property.clientUsage > 0
                                    ? "text-blue-600 underline"
                                    : "text-gray-900"
                                }`}
                              >
                                {property.clientUsage || 0}
                              </span>
                              <span className="text-xs text-gray-500">
                                {property.clientUsage === 1
                                  ? "client"
                                  : "clients"}
                              </span>
                            </button>
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

            {/* Resource Usage Modal */}
            <Dialog
              open={isResourceUsageModalOpen}
              onOpenChange={setIsResourceUsageModalOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    Resources Using "{selectedPropertyForUsage?.propertyName}"
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    {resourcesUsingProperty.length > 0
                      ? `This property is currently assigned to ${
                          resourcesUsingProperty.length
                        } ${
                          resourcesUsingProperty.length === 1
                            ? "resource"
                            : "resources"
                        }`
                      : "This property is not currently assigned to any resources"}
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto">
                  {resourcesUsingProperty.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {resourcesUsingProperty.map((resource) => (
                        <div
                          key={resource.resource_id}
                          className="py-3 px-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {resource.display_label}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Admin Label: {resource.admin_label}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {resource.resource_type?.replace(/_/g, " ") ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        No resources are currently using this property
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsResourceUsageModalOpen(false);
                      setSelectedPropertyForUsage(null);
                      setResourcesUsingProperty([]);
                    }}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Client Usage Modal */}
            <Dialog
              open={isClientUsageModalOpen}
              onOpenChange={setIsClientUsageModalOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    Clients Using "
                    {selectedPropertyForClientUsage?.propertyName}"
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    {companiesUsingProperty.length > 0
                      ? `This property is currently enabled for ${
                          companiesUsingProperty.length
                        } ${
                          companiesUsingProperty.length === 1
                            ? "client"
                            : "clients"
                        }`
                      : "This property is not currently enabled for any clients"}
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto">
                  {companiesUsingProperty.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {companiesUsingProperty.map((company) => (
                        <div
                          key={company.id}
                          className="py-3 px-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {company.name}
                              </p>
                              {company.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {company.description}
                                </p>
                              )}
                            </div>
                            {company.status && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  company.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {company.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        No clients are currently using this property
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsClientUsageModalOpen(false);
                      setSelectedPropertyForClientUsage(null);
                      setCompaniesUsingProperty([]);
                    }}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Client Configuration Tab */}
          <TabsContent value="client-config" className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Property Configuration</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage property access for each client company
                    </p>
                  </div>
                  {selectedCompany && (
                    <Button
                      onClick={saveCompanyProperties}
                      disabled={!hasUnsavedChanges || saving}
                      className="flex items-center gap-2"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Configuration
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 divide-x min-h-[600px]">
                  {/* Left Panel - Companies List */}
                  <div className="col-span-4 overflow-y-auto max-h-[600px]">
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
                        Select a Client
                      </h3>
                      {companies.length > 0 ? (
                        <div className="space-y-1">
                          {companies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() => handleCompanySelect(company)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                selectedCompany?.id === company.id
                                  ? "bg-blue-50 border-2 border-blue-500 text-blue-900"
                                  : "bg-white border-2 border-transparent hover:bg-gray-50"
                              }`}
                            >
                              <div className="font-medium text-sm">
                                {company.name}
                              </div>
                              {company.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {company.description}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-sm">No companies found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Panel - Properties List */}
                  <div className="col-span-8 overflow-y-auto max-h-[600px]">
                    {selectedCompany ? (
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Configure Properties for {selectedCompany.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Enable or disable properties to control resource
                            access for this client
                          </p>
                          {hasUnsavedChanges && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-sm text-yellow-800">
                                <strong>Unsaved changes:</strong> Remember to
                                click "Save Configuration" to apply your
                                changes.
                              </p>
                            </div>
                          )}
                        </div>

                        {recordTypes.length > 0 ? (
                          <div className="space-y-3">
                            {recordTypes.map((property) => (
                              <div
                                key={property.id}
                                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={
                                        companyPropertyStates[property.id] ||
                                        false
                                      }
                                      onCheckedChange={() =>
                                        handlePropertyToggle(property.id)
                                      }
                                    />
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {property.propertyName}
                                      </h4>
                                      {property.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {property.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                      companyPropertyStates[property.id]
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {companyPropertyStates[property.id]
                                      ? "Enabled"
                                      : "Disabled"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <p className="text-sm">
                              No properties available. Create properties in the
                              Properties tab first.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">
                            Select a client from the left panel to configure
                            their property access
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
