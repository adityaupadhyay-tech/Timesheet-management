'use client'

import React, { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'

export default function SettingsPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  // Local dummy UI state (placeholders only)
  const [overtimeTrackingEnabled, setOvertimeTrackingEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [slackTeamsEnabled, setSlackTeamsEnabled] = useState(false)
  const [currencyConversionEnabled, setCurrencyConversionEnabled] = useState(true)
  const [autoGenerateInvoiceEnabled, setAutoGenerateInvoiceEnabled] = useState(false)
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(true)
  const [outlookCalendarEnabled, setOutlookCalendarEnabled] = useState(false)
  const [jiraEnabled, setJiraEnabled] = useState(true)
  const [githubEnabled, setGithubEnabled] = useState(false)

  const Section = ({ title, description, children }) => (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div>
          <CardTitle className="text-lg sm:text-2xl">{title}</CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t p-4 sm:p-6">
          {children}
        </div>
      </CardContent>
    </Card>
  )

  const ToggleRow = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm sm:text-base">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )

  const Pill = ({ children }) => (
    <span className="mr-2 mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{children}</span>
  )

  const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-lg">
          <div className="border-b px-4 py-3">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {children}
          </div>
          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={onClose}>Save</Button>
          </div>
        </div>
      </div>
    )
  }

  const [active, setActive] = useState('company-info')

  const SidebarLink = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActive(id)}
      className={`w-full text-left px-3 py-2 rounded-md text-sm ${active === id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
    >
      {label}
    </button>
  )

  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [roleAddModalOpen, setRoleAddModalOpen] = useState(false)
  const [roleEditModalOpen, setRoleEditModalOpen] = useState(false)
  const [holidayModalOpen, setHolidayModalOpen] = useState(false)
  const [leaveRuleModalOpen, setLeaveRuleModalOpen] = useState(false)
  const [employeeLeaveModalOpen, setEmployeeLeaveModalOpen] = useState(false)
  const [carryForwardEnabled, setCarryForwardEnabled] = useState(true)
  const [defaultAnnualLeave, setDefaultAnnualLeave] = useState(20)
  const [maxCarryForward, setMaxCarryForward] = useState(10)
  const [requireSignature, setRequireSignature] = useState(true)
  const [requireSupervisor, setRequireSupervisor] = useState(true)
  const [backupSupervisor, setBackupSupervisor] = useState('Jane Smith')
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false)

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">Configure system preferences. All controls below are placeholders only.</p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-3 lg:col-span-2">
            <div className="rounded-lg border bg-white p-3 space-y-4">
              <div>
                <div className="px-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Settings</div>
                <div className="space-y-1">
                  <SidebarLink id="company-info" label="Company Info" />
                  <SidebarLink id="company-departments" label="Departments" />
                  <SidebarLink id="company-clients" label="Clients" />
                  <SidebarLink id="company-bank" label="Bank Accounts" />
                  <SidebarLink id="company-holidays" label="Holidays & Leaves" />
                  <SidebarLink id="company-integrations" label="Integrations" />
                </div>
              </div>
              <div>
                <div className="px-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Settings</div>
                <div className="space-y-1">
                  <SidebarLink id="employee-info" label="Employee Info" />
                  <SidebarLink id="employee-roles" label="Roles & Permissions" />
                  <SidebarLink id="employee-access" label="Access Control" />
                </div>
              </div>
              <div>
                <div className="px-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">System Settings</div>
                <div className="space-y-1">
                  <SidebarLink id="system-timesheets" label="Timesheets" />
                  <SidebarLink id="system-approvals" label="Approvals" />
                  <SidebarLink id="system-notifications" label="Notifications" />
                  <SidebarLink id="system-security" label="Security" />
                  <SidebarLink id="system-integrations" label="Integrations" />
                </div>
              </div>
            </div>
          </aside>
          <section className="md:col-span-9 lg:col-span-10 space-y-6">
            <Tabs value={active} onValueChange={(v) => setActive(v)} className="space-y-6">
              <TabsContent value="company-info" className="space-y-6">
                <Section title="General Settings" description="Basic preferences for your organization">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Company Timezone</label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm">
                        <option>UTC+5:30 (India Standard Time)</option>
                        <option>UTC</option>
                        <option>UTC-5:00 (Eastern Time)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Default Currency</label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>INR</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Week Start</label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm">
                        <option>Monday</option>
                        <option>Sunday</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <ToggleRow label="Overtime Tracking" checked={overtimeTrackingEnabled} onChange={() => setOvertimeTrackingEnabled((v) => !v)} />
                    <ToggleRow label="Notifications" checked={notificationsEnabled} onChange={() => setNotificationsEnabled((v) => !v)} />
                  </div>
                  <CardFooter className="px-0 pt-6">
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" type="button">Cancel</Button>
                      <Button type="button">Save</Button>
                    </div>
                  </CardFooter>
                </Section>
              </TabsContent>

              <TabsContent value="company-bank" className="space-y-6">
                <Section title="Bank Accounts" description="Manage company bank accounts">
                  <div className="flex justify-end">
                    <Button variant="outline" type="button" onClick={()=>setBankModalOpen(true)}>Add Bank Account</Button>
                  </div>
                  <div className="overflow-x-auto rounded-md border bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="px-4 py-2">Account Holder</th>
                          <th className="px-4 py-2">Bank Name</th>
                          <th className="px-4 py-2">IFSC</th>
                          <th className="px-4 py-2">Account Number</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { holder: 'TechCorp India Pvt Ltd', bank: 'HDFC Bank', ifsc: 'HDFC0001234', number: 'XXXXXX1234' },
                          { holder: 'TechCorp US Inc.', bank: 'Chase', ifsc: 'CHASUS33XXX', number: 'XXXXXX5678' },
                        ].map((a) => (
                          <tr key={a.number} className="border-t">
                            <td className="px-4 py-2">{a.holder}</td>
                            <td className="px-4 py-2">{a.bank}</td>
                            <td className="px-4 py-2">{a.ifsc}</td>
                            <td className="px-4 py-2">{a.number}</td>
                            <td className="px-4 py-2">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" type="button" onClick={()=>setBankModalOpen(true)}>Edit</Button>
                                <Button variant="outline" size="sm" type="button">Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </TabsContent>

              <Modal open={holidayModalOpen} title="Add Holiday" onClose={()=>setHolidayModalOpen(false)}>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Holiday Name</label>
                    <input className="w-full rounded-md border px-3 py-2" placeholder="Diwali" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Date</label>
                    <input type="date" className="w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Company</label>
                    <select className="w-full rounded-md border px-3 py-2">
                      <option>TechCorp India Pvt Ltd</option>
                      <option>TechCorp US Inc.</option>
                      <option>FinServe UK Ltd</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select className="w-full rounded-md border px-3 py-2">
                      <option>Paid</option>
                      <option>Optional</option>
                    </select>
                  </div>
                </div>
              </Modal>

              <TabsContent value="system-notifications" className="space-y-6">
                <Section title="Notifications & Alerts" description="Configure delivery and alert preferences">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-2">
                        <ToggleRow label="Email Notifications" checked={emailNotificationsEnabled} onChange={() => setEmailNotificationsEnabled((v) => !v)} />
                        <ToggleRow label="Slack/Teams Integration" checked={slackTeamsEnabled} onChange={() => setSlackTeamsEnabled((v) => !v)} />
                      </div>
                      <div className="mt-4">
                        <label className="mb-1 block text-sm font-medium">Reminder Frequency</label>
                        <select className="w-full rounded-md border px-3 py-2 text-sm">
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>On Due Date</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-medium">Alert Types</div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {['Timesheet Not Submitted','Overtime Exceeded','Holiday Approvals Pending'].map((label) => (
                          <label key={label} className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4" defaultChecked={label !== 'Holiday Approvals Pending'} />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardFooter className="px-0 pt-6">
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" type="button">Test Notification</Button>
                      <Button type="button">Save</Button>
                    </div>
                  </CardFooter>
                </Section>
              </TabsContent>

              <TabsContent value="employee-roles" className="space-y-6">
                <Section title="Roles & Permissions" description="Assign roles and manage permissions">
                  <div className="space-y-3 text-sm">
                    <div className="rounded-md border p-3">
                      <div className="font-medium">Roles</div>
                      <div className="mt-2 flex flex-wrap">
                        {['Admin','Manager','Employee','Contractor'].map((r) => (<Pill key={r}>{r}</Pill>))}
                      </div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="font-medium mb-2">Permissions Matrix</div>
                      <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm">
                        <div></div>
                        {['View','Edit','Approve','Delete','Submit Timesheet','Approve Timesheet','Edit Timesheet','Override Leave Policy'].map(p => (
                          <div key={p} className="text-gray-600 font-medium">{p}</div>
                        ))}
                        {['Admin','Manager','Employee','Contractor'].map(role => (
                          <React.Fragment key={role}>
                            <div className="font-medium">{role}</div>
                            {['view','edit','approve','delete','submit','approve_ts','edit_ts','override_leave'].map(k => (
                              <label key={`${role}-${k}`} className="flex items-center justify-center">
                                <input type="checkbox" className="h-4 w-4" defaultChecked={role !== 'Contractor'} />
                              </label>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardFooter className="px-0 pt-6">
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" type="button">Add User</Button>
                      <Button variant="outline" type="button">Edit</Button>
                      <Button type="button">Save</Button>
                    </div>
                  </CardFooter>
                </Section>
              </TabsContent>

              <TabsContent value="company-integrations" className="space-y-6">
                <Section title="Integrations" description="Enable or disable third-party integrations">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ToggleRow label="Google Calendar Sync" checked={googleCalendarEnabled} onChange={() => setGoogleCalendarEnabled((v) => !v)} />
                    <ToggleRow label="Outlook Calendar Sync" checked={outlookCalendarEnabled} onChange={() => setOutlookCalendarEnabled((v) => !v)} />
                    <ToggleRow label="Jira Integration" checked={jiraEnabled} onChange={() => setJiraEnabled((v) => !v)} />
                    <ToggleRow label="GitHub Integration" checked={githubEnabled} onChange={() => setGithubEnabled((v) => !v)} />
                  </div>
                  <CardFooter className="px-0 pt-6">
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" type="button">Connect</Button>
                      <Button type="button">Save</Button>
                    </div>
                  </CardFooter>
                </Section>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </Layout>
  )
}