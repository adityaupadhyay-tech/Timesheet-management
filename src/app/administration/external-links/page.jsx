'use client'

import React, { useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LinkIcon from '@mui/icons-material/Link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ExternalLinksPage() {
  const currentUser = {
    name: 'Admin User',
    role: 'admin',
  }

  const initialLinks = useMemo(() => ([
    { id: 1, label: 'Company Website', address: 'https://example.com', description: 'Public corporate site', linkType: 'any', displayMethod: 'new', displayInMenu: false, menuTopLevel: '', menuCategory: '' },
    { id: 2, label: 'HR Portal', address: 'https://hr.example.com', description: 'Internal HR resources', linkType: 'employee', displayMethod: 'current', displayInMenu: false, menuTopLevel: '', menuCategory: '' },
    { id: 3, label: 'Benefits Provider', address: 'https://benefits.example.com', description: 'Benefits enrollment and info', linkType: 'employee', displayMethod: 'new', displayInMenu: true, menuTopLevel: 'Resources', menuCategory: 'Benefits' },
    { id: 4, label: 'Support Desk', address: 'https://support.example.com', description: 'Ticketing and help center', linkType: 'client', displayMethod: 'embed', displayInMenu: false, menuTopLevel: '', menuCategory: '' },
  ]), [])

  const [links, setLinks] = useState(initialLinks)
  const [showEditor, setShowEditor] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const openEditor = (link) => {
    setEditing({
      id: link.id,
      label: link.label || '',
      address: link.address || '',
      description: link.description || '',
      linkType: link.linkType || 'any',
      displayMethod: link.displayMethod || 'new',
      displayInMenu: !!link.displayInMenu,
      menuTopLevel: link.menuTopLevel || '',
      menuCategory: link.menuCategory || '',
    })
    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditing(null)
  }

  const saveEditor = () => {
    if (!editing) return
    setLinks(prev => prev.map(l => l.id === editing.id ? { ...l, ...editing } : l))
    closeEditor()
  }

  const requestDelete = () => {
    if (!editing) return
    setShowDeleteConfirm(true)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const confirmDelete = () => {
    if (!editing) return
    setLinks(prev => prev.filter(l => l.id !== editing.id))
    setShowDeleteConfirm(false)
    closeEditor()
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="External Link Manager"
          subtitle="Manage commonly used external resources for your organization"
          icon={<LinkIcon />}
          breadcrumbs={[
            { label: 'Administration', href: '/administration' },
            { label: 'External Link Manager' },
          ]}
        />

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-6 py-3 font-medium text-gray-700">Label</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-700">Address</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openEditor(link)}>
                    <td className="px-6 py-3 font-medium text-gray-900">{link.label}</td>
                    <td className="px-6 py-3">
                      <a
                        href={link.address}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {link.address}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-400">Click to edit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showEditor && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeEditor} />
            <div className="relative bg-white rounded-lg w-full max-w-lg shadow-xl border">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Link</h3>
                <Button variant="outline" onClick={closeEditor}>Close</Button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={editing.label} onChange={(e) => setEditing(v => ({ ...v, label: e.target.value }))} placeholder="e.g., Company Website" />
                </div>

                <div>
                  <Label htmlFor="address">Web address</Label>
                  <Input id="address" type="url" value={editing.address} onChange={(e) => setEditing(v => ({ ...v, address: e.target.value }))} placeholder="https://..." />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={editing.description}
                    onChange={(e) => setEditing(v => ({ ...v, description: e.target.value }))}
                    placeholder="Short description"
                    className="mt-2 w-full border rounded-md px-3 py-2 min-h-[96px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label>Link type</Label>
                  <div className="mt-2 flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="linkType" className="accent-blue-600" checked={editing.linkType === 'employee'} onChange={() => setEditing(v => ({ ...v, linkType: 'employee' }))} />
                      <span>Employee</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="linkType" className="accent-blue-600" checked={editing.linkType === 'client'} onChange={() => setEditing(v => ({ ...v, linkType: 'client' }))} />
                      <span>Client</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="linkType" className="accent-blue-600" checked={editing.linkType === 'any'} onChange={() => setEditing(v => ({ ...v, linkType: 'any' }))} />
                      <span>Any</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayMethod">Display method</Label>
                  <select
                    id="displayMethod"
                    value={editing.displayMethod}
                    onChange={(e) => setEditing(v => ({ ...v, displayMethod: e.target.value }))}
                    className="mt-2 w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New window</option>
                    <option value="current">Current window</option>
                    <option value="embed">Embed on page</option>
                  </select>
                </div>

                <div>
                  <Label>Display in menu</Label>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={!!editing.displayInMenu}
                        onChange={(e) => setEditing(v => ({ ...v, displayInMenu: e.target.checked }))}
                      />
                      <span>Show this link in a navigation menu</span>
                    </label>
                  </div>

                  {editing.displayInMenu && (
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="menuTopLevel">Top level menu</Label>
                        <select
                          id="menuTopLevel"
                          value={editing.menuTopLevel}
                          onChange={(e) => setEditing(v => ({ ...v, menuTopLevel: e.target.value }))}
                          className="mt-2 w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          <option value="Administration">Administration</option>
                          <option value="Resources">Resources</option>
                          <option value="Tools">Tools</option>
                          <option value="Help">Help</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="menuCategory">Category</Label>
                        <Input
                          id="menuCategory"
                          value={editing.menuCategory}
                          onChange={(e) => setEditing(v => ({ ...v, menuCategory: e.target.value }))}
                          placeholder="e.g., Benefits, HR, Docs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t flex justify-between gap-3">
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={requestDelete}>Delete</Button>
                <Button variant="outline" onClick={closeEditor}>Cancel</Button>
                <Button onClick={saveEditor}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
            <div className="relative bg-white rounded-lg w-full max-w-sm shadow-xl border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Link</h3>
                <p className="text-sm text-gray-600">This action cannot be undone. Are you sure you want to delete <span className="font-medium text-gray-900">{editing?.label}</span>?</p>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}


