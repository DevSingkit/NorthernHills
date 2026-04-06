'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type StaffMember = {
  id: string
  auth_user_id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  created_at: string
}

const navItems = [
  { label: 'Dashboard',    href: '/admin',         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: 'Events',       href: '/admin/events',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: 'Participants', href: '/admin/reports', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Billing',      href: '/admin/reports', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { label: 'Chatbot Logs', href: '/admin/chats',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: 'Staff',        href: '/admin/staff',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Reports',      href: '/admin/reports', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
]

export default function AdminStaffPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Add staff form
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<'admin' | 'staff'>('staff')

  // Edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState<'admin' | 'staff'>('staff')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => { fetchStaff() }, [])

  async function fetchStaff() {
    setLoading(true)
    const { data, error } = await supabase
      .from('staff_accounts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setStaff(data || [])
    setLoading(false)
  }

  async function handleAddStaff() {
    if (!formName || !formEmail || !formPassword) {
      setError('Name, email, and password are required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    // 1. Create Supabase Auth user via admin API
    // Since we're on client side, we use signUp — staff will get a confirmation email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formEmail,
      password: formPassword,
      options: {
        data: { name: formName, role: formRole }
      }
    })

    if (authError) {
      setError('Auth error: ' + authError.message)
      setSaving(false)
      return
    }

    if (!authData.user) {
      setError('Failed to create auth user.')
      setSaving(false)
      return
    }

    // 2. Insert into staff_accounts
    const { error: insertError } = await supabase
      .from('staff_accounts')
      .insert([{
        auth_user_id: authData.user.id,
        name: formName,
        email: formEmail,
        role: formRole
      }])

    if (insertError) {
      setError('Staff record error: ' + insertError.message)
      setSaving(false)
      return
    }

    setSuccess(`Staff account created for ${formName}. They will receive a confirmation email.`)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole('staff')
    setShowForm(false)
    setSaving(false)
    fetchStaff()
  }

  async function handleDelete(member: StaffMember) {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return
    const { error } = await supabase
      .from('staff_accounts')
      .delete()
      .eq('id', member.id)
    if (error) setError(error.message)
    else fetchStaff()
  }

  async function handleEdit(member: StaffMember) {
    setEditId(member.id)
    setEditName(member.name)
    setEditRole(member.role)
  }

  async function saveEdit(id: string) {
    setEditSaving(true)
    const { error } = await supabase
      .from('staff_accounts')
      .update({ name: editName, role: editRole })
      .eq('id', id)
    if (error) setError(error.message)
    setEditId(null)
    setEditSaving(false)
    fetchStaff()
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white', boxSizing: 'border-box' as const
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 5 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: '#1a0a2e', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/FUR.png" alt="Northern Hills" width={34} height={34} />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Northern Hills</div>
              <div style={{ color: '#39d353', fontSize: 9, letterSpacing: '0.1em', fontWeight: 600 }}>ADMIN PANEL</div>
            </div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: pathname === item.href ? 'white' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              background: pathname === item.href ? 'rgba(123,45,139,0.35)' : 'transparent',
              borderLeft: `3px solid ${pathname === item.href ? '#7b2d8b' : 'transparent'}`,
              transition: 'all 0.15s', cursor: 'pointer'
            }}>
              <span style={{ opacity: pathname === item.href ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'inherit', padding: 0
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1 }}>

        {/* TOP BAR */}
        <header style={{
          background: 'white', height: 60, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px',
          borderBottom: '1px solid #ede8f3', position: 'sticky', top: 0, zIndex: 30
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1a0a2e', margin: 0 }}>Staff Management</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchStaff} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: 'white', color: '#7b2d8b',
              border: '1.5px solid #e8d5f0', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <button onClick={() => { setShowForm(true); setError(''); setSuccess('') }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: '#7b2d8b', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Staff
            </button>
          </div>
        </header>

        <div style={{ padding: '28px 32px' }}>

          {/* Alerts */}
          {error && (
            <div style={{
              background: '#fff0f0', border: '1px solid #fecaca', color: '#ef4444',
              borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 20
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
              borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 20
            }}>{success}</div>
          )}

          {/* Staff Table */}
          <div style={{
            background: 'white', borderRadius: 12, border: '1px solid #ede8f3',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 24
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #ede8f3' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>Staff Accounts</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{staff.length} member{staff.length !== 1 ? 's' : ''}</div>
            </div>

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#aaa', fontSize: 14 }}>Loading...</div>
            ) : staff.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                No staff accounts yet. Add one below.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '11px 20px',
                        fontSize: 11, fontWeight: 700, color: '#aaa',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        borderBottom: '1px solid #ede8f3'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member, i) => (
                    <tr key={member.id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '14px 20px' }}>
                        {editId === member.id ? (
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            style={{ ...inputStyle, width: 160 }} />
                        ) : (
                          <div style={{ fontWeight: 700, color: '#1a0a2e' }}>{member.name}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#555' }}>{member.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {editId === member.id ? (
                          <select value={editRole} onChange={e => setEditRole(e.target.value as any)}
                            style={{ ...inputStyle, width: 110, cursor: 'pointer' }}>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span style={{
                            padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                            background: member.role === 'admin' ? '#f5edf8' : '#eff6ff',
                            color: member.role === 'admin' ? '#7b2d8b' : '#3b82f6'
                          }}>{member.role}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#999', fontSize: 12 }}>
                        {new Date(member.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {editId === member.id ? (
                            <>
                              <button onClick={() => saveEdit(member.id)} disabled={editSaving} style={{
                                padding: '5px 12px', background: '#39d353', color: 'white',
                                border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit'
                              }}>{editSaving ? 'Saving...' : 'Save'}</button>
                              <button onClick={() => setEditId(null)} style={{
                                padding: '5px 12px', background: 'white', color: '#888',
                                border: '1px solid #e8d5f0', borderRadius: 6, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                              }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(member)} style={{
                                padding: '5px 12px', background: '#f5edf8', color: '#7b2d8b',
                                border: '1px solid #e8d5f0', borderRadius: 6, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                              }}>Edit</button>
                              <button onClick={() => handleDelete(member)} style={{
                                padding: '5px 12px', background: '#fff0f0', color: '#ef4444',
                                border: '1px solid #fecaca', borderRadius: 6, fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                              }}>Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add Staff Form */}
          {showForm && (
            <div style={{
              background: 'white', borderRadius: 12, padding: 28,
              border: '1.5px solid #e8d5f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>Add New Staff Account</h2>
                  <p style={{ fontSize: 12, color: '#999' }}>This will create a Supabase Auth account. Staff will receive a confirmation email.</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{
                  background: 'none', border: 'none', color: '#aaa',
                  fontSize: 20, cursor: 'pointer', lineHeight: 1
                }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input placeholder="e.g. Dr. Maria Reyes" value={formName}
                    onChange={e => setFormName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input placeholder="staff@nhvc.com" type="email" value={formEmail}
                    onChange={e => setFormEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input placeholder="Min. 8 characters" type="password" value={formPassword}
                    onChange={e => setFormPassword(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value as any)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowForm(false)} style={{
                  padding: '10px 20px', background: 'white', color: '#888',
                  border: '1px solid #e8d5f0', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>Cancel</button>
                <button onClick={handleAddStaff} disabled={saving} style={{
                  padding: '10px 24px', background: saving ? '#b57cc7' : '#7b2d8b',
                  color: 'white', border: 'none', borderRadius: 8, fontSize: 13,
                  fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                }}>{saving ? 'Creating...' : 'Create Staff Account'}</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}