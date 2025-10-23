"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  Description as DescriptionIcon,
  Work as WorkIcon,
  Label as LabelIcon,
  VideoLibrary as VideoLibraryIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { useSupabase } from "@/contexts/SupabaseContext";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

export default function ResourcesPage() {
  const { user: currentUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [resourceCategories, setResourceCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Fetch resources with filtering for unpublished
  const fetchPublishedResources = async () => {
    try {
      setLoading(true);

      // Step 1: Find the "Unpublished" property ID
      const { data: unpublishedProperty, error: propertyError } = await supabase
        .from("resource_properties")
        .select("property_id")
        .ilike("property_label", "unpublished")
        .single();

      let unpublishedPropertyId = null;
      if (!propertyError && unpublishedProperty) {
        unpublishedPropertyId = unpublishedProperty.property_id;
      }

      // Step 2: Fetch all resource groups (categories)
      const { data: groups, error: groupsError } = await supabase
        .from("resource_groups")
        .select("*")
        .order("display_label", { ascending: true });

      if (groupsError) {
        console.error("Error fetching resource groups:", groupsError);
        setLoading(false);
        return;
      }

      // Step 3: Fetch all resource items
      const { data: items, error: itemsError } = await supabase
        .from("resource_items")
        .select("*")
        .order("display_label", { ascending: true });

      if (itemsError) {
        console.error("Error fetching resource items:", itemsError);
        setLoading(false);
        return;
      }

      // Step 4: If we found an "Unpublished" property, filter out resources tagged with it
      let publishedItems = items || [];
      if (unpublishedPropertyId) {
        // Fetch all resource_ids tagged as "Unpublished"
        const { data: unpublishedLinks, error: linksError } = await supabase
          .from("resource_item_properties")
          .select("resource_id")
          .eq("property_id", unpublishedPropertyId);

        if (!linksError && unpublishedLinks) {
          const unpublishedResourceIds = unpublishedLinks.map(
            (link) => link.resource_id
          );
          // Filter out unpublished resources
          publishedItems = items.filter(
            (item) => !unpublishedResourceIds.includes(item.resource_id)
          );
        }
      }

      // Step 5: Transform the data to match the component's structure
      const categoriesWithDocuments = groups.map((group) => {
        const categoryDocuments = publishedItems
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
          icon: group.icon_class || "Folder",
          documents: categoryDocuments,
        };
      });

      // Only show categories that have at least one document
      const categoriesWithContent = categoriesWithDocuments.filter(
        (cat) => cat.documents.length > 0
      );

      setResourceCategories(categoriesWithContent);

      // Set all categories as expanded by default
      const expandedState = {};
      categoriesWithContent.forEach((cat) => {
        expandedState[cat.id] = true;
      });
      setExpandedCategories(expandedState);
    } catch (error) {
      console.error("Error in fetchPublishedResources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPublishedResources();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent =
      {
        Description: DescriptionIcon,
        Work: WorkIcon,
        Label: LabelIcon,
        VideoLibrary: VideoLibraryIcon,
        EventNote: EventNoteIcon,
        Person: PersonIcon,
        DirectionsCar: DirectionsCarIcon,
        Folder: FolderIcon,
      }[iconName] || FolderIcon;

    return <IconComponent className="h-5 w-5" />;
  };

  // Render resource based on its type
  const renderResource = (doc) => {
    const details = doc.details || {};

    switch (doc.type) {
      case "html_text":
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium text-gray-900">{doc.displayLabel}</h4>
            </div>
            {details.image_url && (
              <img
                src={details.image_url}
                alt={doc.displayLabel}
                className="max-w-full h-auto rounded-lg mb-2 max-h-48 object-cover"
              />
            )}
            {doc.instructions && (
              <p className="text-sm text-gray-600">{doc.instructions}</p>
            )}
          </div>
        );

      case "pdf_document":
        return (
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-500" />
              <a
                href={details.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {doc.displayLabel}
              </a>
            </div>
            {doc.instructions && (
              <p className="text-sm text-gray-600 mt-2">{doc.instructions}</p>
            )}
          </div>
        );

      case "external_link":
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <a
                href={details.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-2"
              >
                {doc.displayLabel}
                <span className="text-xs">↗</span>
              </a>
            </div>
            {details.image_url && (
              <img
                src={details.image_url}
                alt={doc.displayLabel}
                className="max-w-full h-auto rounded-lg mb-2 max-h-32 object-cover"
              />
            )}
            {doc.instructions && (
              <p className="text-sm text-gray-600">{doc.instructions}</p>
            )}
          </div>
        );

      case "contact_info":
        return (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {doc.displayLabel}
            </h4>
            <div className="space-y-2">
              {details.profile_pic_url && (
                <img
                  src={details.profile_pic_url}
                  alt={details.name || doc.displayLabel}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              )}
              {details.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{details.name}</span>
                </div>
              )}
              {details.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${details.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {details.email}
                  </a>
                </div>
              )}
              {details.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a
                    href={`tel:${details.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {details.phone}
                  </a>
                </div>
              )}
            </div>
            {doc.instructions && (
              <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                {doc.instructions}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <h4 className="font-medium text-gray-900">{doc.displayLabel}</h4>
            {doc.instructions && (
              <p className="text-sm text-gray-600 mt-1">{doc.instructions}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Resources"
          subtitle="Access company resources, documentation, and helpful materials"
          icon={<FolderIcon />}
          breadcrumbs={[{ label: "Resources" }]}
        />

        <Card className="mt-6">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : resourceCategories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  No resources available
                </p>
                <p className="text-sm">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-6">
                {resourceCategories.map((category) => (
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
                    </div>
                    {expandedCategories[category.id] && (
                      <div className="divide-y">
                        {category.documents.length > 0 ? (
                          category.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                              {renderResource(doc)}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No resources available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
