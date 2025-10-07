"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import LinkIcon from "@mui/icons-material/Link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
//import { toast } from "sonner";

// A constant for the new link structure to avoid repetition
const NEW_LINK_TEMPLATE = {
  id: null,
  label: "",
  web_address: "",
  description: "",
  type: "Any",
  display: "New window",
  show_in_menu: false,
  top_level_menu: "", // New field
  menu_category: "", // New field
};

export default function ExternalLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // --- Database Functions (CRUD) ---

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast.error("Failed to fetch links.", { description: error.message });
      console.error("Error fetching links: ", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLink = async () => {
    if (!editing) return;

    // Map form state to database schema, including the new fields
    const linkData = {
      label: editing.label,
      web_address: editing.web_address,
      description: editing.description,
      type: editing.type,
      display: editing.display,
      show_in_menu: editing.show_in_menu,
      top_level_menu: editing.top_level_menu || null, // Send null to DB if empty
      menu_category: editing.menu_category || null, // Send null to DB if empty
    };

    try {
      let error;
      if (editing.id) {
        // Update existing link
        ({ error } = await supabase
          .from("links")
          .update(linkData)
          .eq("id", editing.id));
      } else {
        // Create new link
        ({ error } = await supabase.from("links").insert(linkData));
      }

      if (error) throw error;
      toast.success(
        `Link has been successfully ${editing.id ? "updated" : "added"}.`
      );

      closeEditor();
      await fetchLinks(); // Refresh data from DB
    } catch (error) {
      toast.error("Failed to save the link.", { description: error.message });
      console.error("Error saving link: ", error);
    }
  };

  const deleteLink = async () => {
    if (!editing?.id) return;

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", editing.id);
      if (error) throw error;

      toast.success("Link deleted successfully.");
      setShowDeleteConfirm(false);
      closeEditor();
      await fetchLinks(); // Refresh data from DB
    } catch (error) {
      toast.error("Failed to delete the link.", { description: error.message });
      console.error("Error deleting link: ", error);
    }
  };

  // --- Component Lifecycle ---

  useEffect(() => {
    fetchLinks();
  }, []);

  // --- UI Event Handlers ---

  const openEditor = (link = null) => {
    // If no link is provided, use the new link template.
    // Otherwise, map the DB fields to the form state fields, including new fields.
    setEditing(
      link
        ? {
            id: link.id,
            label: link.label,
            web_address: link.web_address,
            description: link.description,
            type: link.type,
            display: link.display,
            show_in_menu: link.show_in_menu,
            top_level_menu: link.top_level_menu,
            menu_category: link.menu_category,
          }
        : { ...NEW_LINK_TEMPLATE }
    );
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditing(null);
  };

  const requestDelete = () => {
    if (!editing) return;
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Layout userName="Admin User" userRole="admin">
      <div className="p-6">
        <PageHeader
          title="External Link Manager"
          subtitle="Manage commonly used external resources for your organization"
          icon={<LinkIcon />}
          breadcrumbs={[
            { label: "Administration", href: "/administration" },
            { label: "External Link Manager" },
          ]}
        />

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-end">
            <Button
              onClick={() => openEditor()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add New Link
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-6 py-3 font-medium text-gray-700">
                    Label
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-700">
                    Address
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center p-6 text-gray-500">
                      Loading links...
                    </td>
                  </tr>
                ) : links.length > 0 ? (
                  links.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEditor(link)}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {link.label}
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={link.web_address}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // Prevents modal from opening when link is clicked
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {link.web_address}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-gray-400">
                        Click to edit
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-6 text-gray-500">
                      No links found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showEditor && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeEditor}
            />
            <div className="relative bg-white rounded-lg w-full max-w-lg shadow-xl border">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editing.id ? "Edit Link" : "Add New Link"}
                </h3>
                <Button variant="outline" onClick={closeEditor}>
                  Close
                </Button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={editing.label}
                    onChange={(e) =>
                      setEditing((v) => ({ ...v, label: e.target.value }))
                    }
                    placeholder="e.g., Company Website"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Web address</Label>
                  <Input
                    id="address"
                    type="url"
                    value={editing.web_address}
                    onChange={(e) =>
                      setEditing((v) => ({ ...v, web_address: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={editing.description || ""}
                    onChange={(e) =>
                      setEditing((v) => ({ ...v, description: e.target.value }))
                    }
                    placeholder="Short description"
                    className="mt-2 w-full border rounded-md px-3 py-2 min-h-[96px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label>Link type</Label>
                  <div className="mt-2 flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="linkType"
                        className="accent-blue-600"
                        checked={editing.type === "Employee"}
                        onChange={() =>
                          setEditing((v) => ({ ...v, type: "Employee" }))
                        }
                      />
                      <span>Employee</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="linkType"
                        className="accent-blue-600"
                        checked={editing.type === "Client"}
                        onChange={() =>
                          setEditing((v) => ({ ...v, type: "Client" }))
                        }
                      />
                      <span>Client</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="linkType"
                        className="accent-blue-600"
                        checked={editing.type === "Any"}
                        onChange={() =>
                          setEditing((v) => ({ ...v, type: "Any" }))
                        }
                      />
                      <span>Any</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="displayMethod">Display method</Label>
                  <select
                    id="displayMethod"
                    value={editing.display}
                    onChange={(e) =>
                      setEditing((v) => ({ ...v, display: e.target.value }))
                    }
                    className="mt-2 w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New window">New window</option>
                    <option value="Current page">Current page</option>
                    <option value="Embed on page">Embed on page</option>
                  </select>
                </div>
                <div>
                  <Label>Display in menu</Label>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={!!editing.show_in_menu}
                        onChange={(e) =>
                          setEditing((v) => ({
                            ...v,
                            show_in_menu: e.target.checked,
                          }))
                        }
                      />
                      <span>Show this link in a navigation menu</span>
                    </label>
                  </div>

                  {editing.show_in_menu && (
                    <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="top_level_menu">Top level menu</Label>
                        <select
                          id="top_level_menu"
                          value={editing.top_level_menu || ""}
                          onChange={(e) =>
                            setEditing((v) => ({
                              ...v,
                              top_level_menu: e.target.value,
                            }))
                          }
                          className="mt-2 w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="Administration">Administration</option>
                          <option value="My stuff">My stuff</option>
                          <option value="Payroll">Payroll</option>
                          <option value="personnel">Personnel</option>
                          <option value="tools">Tools</option>
                          <option value="resources">Resources</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="menu_category">Category</Label>
                        <Input
                          id="menu_category"
                          value={editing.menu_category || ""}
                          onChange={(e) =>
                            setEditing((v) => ({
                              ...v,
                              menu_category: e.target.value,
                            }))
                          }
                          placeholder="e.g., Benefits, HR, Docs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t flex justify-between gap-3">
                <div>
                  {editing.id ? (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={requestDelete}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeEditor}>
                    Cancel
                  </Button>
                  <Button onClick={saveLink}>Save</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={cancelDelete}
            />
            <div className="relative bg-white rounded-lg w-full max-w-sm shadow-xl border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Delete Link
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {editing?.label}
                  </span>
                  ?
                </p>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={deleteLink}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
