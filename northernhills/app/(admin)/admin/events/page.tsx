'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type Event = {
  id: string
  event_name: string
  event_date: string
  barangay: string
  venue_address: string
  max_slots: number
  event_status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
}

const navItems = [
  { label: 'Dashboard',    href: '/admin',           icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: 'Events',       href: '/admin/events',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: 'Participants', href: '/admin/reports',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Billing',      href: '/admin/reports',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { label: 'Chatbot Logs', href: '/admin/chats',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: 'Staff',        href: '/admin/staff',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Reports',      href: '/admin/reports',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
]

export default function AdminEventsPage() {
  const [active, setActive] = useState('Dashboard')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    barangay: '',
    venue_address: '',
    max_slots: '',
    event_status: 'draft' as const
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error } = await supabase
      .from('events')
      .insert([{
        event_name: formData.event_name,
        event_date: formData.event_date,
        barangay: formData.barangay,
        venue_address: formData.venue_address,
        max_slots: parseInt(formData.max_slots) || 50,
        event_status: formData.event_status
      }])

    if (error) {
      setError('Error creating event: ' + error.message)
      setSaving(false)
      return
    }

    // Reset form
    setFormData({
      event_name: '',
      event_date: '',
      barangay: '',
      venue_address: '',
      max_slots: '',
      event_status: 'draft'
    })
    setShowForm(false)
    setSaving(false)
    fetchEvents()
  }

  async function updateStatus(id: string, status: Event['event_status']) {
    const { error } = await supabase
      .from('events')
      .update({ event_status: status })
      .eq('id', id)

    if (error) {
      alert('Error updating status: ' + error.message)
    } else {
      fetchEvents()
    }
  }

  const statusColors = {
    draft: { bg: '#f0f0f0', text: '#666', border: '#d0d0d0' },
    published: { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784' },
    ongoing: { bg: '#e3f2fd', text: '#1565c0', border: '#64b5f6' },
    completed: { bg: '#f3e5f5', text: '#7b1fa2', border: '#ba68c8' },
    cancelled: { bg: '#ffebee', text: '#c62828', border: '#ef5350' }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white', boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600, color: '#444', marginBottom: 6
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fafafa',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: '#1a0a2e',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 40
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/FUR.png" alt="Northern Hills" width={34} height={34} />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Northern Hills</div>
              <div style={{ color: '#39d353', fontSize: 9, letterSpacing: '0.1em', fontWeight: 600 }}>ADMIN PANEL</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActive(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px', fontSize: 13, fontWeight: 500,
                color: active === item.label ? 'white' : 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                background: active === item.label ? 'rgba(123,45,139,0.35)' : 'transparent',
                borderLeft: `3px solid ${active === item.label ? '#7b2d8b' : 'transparent'}`,
                transition: 'all 0.15s', cursor: 'pointer'
              }}
            >
              <span style={{ opacity: active === item.label ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.07)'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: 12, transition: 'color 0.15s', cursor: 'pointer'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </Link>
        </div>
      </aside>


      {/* Main Content */}
      <div style={{ marginLeft: 240, padding: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>
              Events Management
            </h1>
            <p style={{ color: '#999', fontSize: 14 }}>
              Create and manage outreach events across barangays
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#7b2d8b', color: 'white',
              padding: '12px 24px', borderRadius: 10,
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}>
            {showForm ? '✕ Cancel' : '+ Create New Event'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 32, marginBottom: 32,
            border: '1.5px solid #e8d5f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a0a2e', marginBottom: 24 }}>
              Create New Event
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Event Name</label>
                  <input
                    required
                    placeholder="e.g. SNP Outreach - Barangay 123"
                    value={formData.event_name}
                    onChange={e => setFormData({ ...formData, event_name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Event Date</label>
                    <input
                      required
                      type="date"
                      value={formData.event_date}
                      onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Barangay</label>
                    <input
                      required
                      placeholder="e.g. Barangay 123, Caloocan"
                      value={formData.barangay}
                      onChange={e => setFormData({ ...formData, barangay: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Venue Address</label>
                  <input
                    required
                    placeholder="Full venue address"
                    value={formData.venue_address}
                    onChange={e => setFormData({ ...formData, venue_address: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Max Slots</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 50"
                      value={formData.max_slots}
                      onChange={e => setFormData({ ...formData, max_slots: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Initial Status</label>
                    <select
                      value={formData.event_status}
                      onChange={e => setFormData({ ...formData, event_status: e.target.value as any })}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#fff0f0', border: '1px solid #fecaca',
                    color: '#ef4444', borderRadius: 8, padding: '12px 16px',
                    fontSize: 13
                  }}>{error}</div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: saving ? '#b57cc7' : '#7b2d8b',
                    color: 'white', padding: '13px',
                    borderRadius: 10, border: 'none',
                    fontSize: 15, fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s'
                  }}>
                  {saving ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 16,
            padding: 60, textAlign: 'center',
            border: '1.5px solid #e8d5f0'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a0a2e', marginBottom: 8 }}>
              No Events Yet
            </h3>
            <p style={{ color: '#999', fontSize: 14 }}>
              Create your first outreach event to get started
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: 16,
            border: '1.5px solid #e8d5f0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1.5px solid #e8d5f0' }}>
                  {['Event Name', 'Date', 'Barangay', 'Venue', 'Slots', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '16px 20px',
                      fontSize: 12, fontWeight: 700, color: '#666',
                      letterSpacing: '0.06em', textTransform: 'uppercase'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => {
                  const sc = statusColors[event.event_status]
                  return (
                    <tr key={event.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>
                        {event.event_name}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#555' }}>
                        {new Date(event.event_date).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#555' }}>
                        {event.barangay}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#777', maxWidth: 200 }}>
                        {event.venue_address}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#555' }}>
                        {event.max_slots}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          background: sc.bg, color: sc.text,
                          border: `1px solid ${sc.border}`,
                          padding: '4px 12px', borderRadius: 6,
                          fontSize: 12, fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {event.event_status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={event.event_status}
                          onChange={e => updateStatus(event.id, e.target.value as any)}
                          style={{
                            padding: '6px 10px', fontSize: 12,
                            border: '1.5px solid #e8d5f0',
                            borderRadius: 6, cursor: 'pointer',
                            fontFamily: 'inherit', background: 'white'
                          }}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}