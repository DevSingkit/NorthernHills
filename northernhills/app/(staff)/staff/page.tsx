'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type Participant = {
  registration_id: string
  event_id: string
  queue_number: number | null
  registration_type: string
  checked_in_at: string | null
  discharged_at: string | null
  owner_id: string
  owner_name: string
  contact_number: string
  email: string
  payment_status: string | null
  total_amount: number | null
  payment_method: string | null
  pre_op_sent: boolean
  post_op_sent: boolean
  pet_count: number
  pets_complete: number
  pets_rejected: number
  pets_on_process: number
  chatbot_status: string | null
  chatbot_token: string | null
}

type Event = {
  id: string
  name: string
  location: string
  event_date: string
  status: string
  slot_limit: number | null
}

const statusColor = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    complete:    { bg: '#f0fdf4', color: '#16a34a' },
    on_process:  { bg: '#f5edf8', color: '#7b2d8b' },
    rejected:    { bg: '#fff0f0', color: '#ef4444' },
    paid:        { bg: '#f0fdf4', color: '#16a34a' },
    unpaid:      { bg: '#fff8f0', color: '#d97706' },
    active:      { bg: '#eff6ff', color: '#3b82f6' },
    not_started: { bg: '#f3f4f6', color: '#888' },
    expired:     { bg: '#f3f4f6', color: '#888' },
    pre_registered: { bg: '#f5edf8', color: '#7b2d8b' },
    walk_in:     { bg: '#fff8f0', color: '#d97706' },
  }
  return map[status] || { bg: '#f3f4f6', color: '#888' }
}

const Pill = ({ label }: { label: string }) => {
  const s = statusColor(label)
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: 'nowrap'
    }}>
      {label.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  )
}

const sideNav = [
  { label: 'Dashboard',    href: '/staff', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: 'Walk-In',      href: '/staff/walkin',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
  { label: 'QR Check-In',  href: '/staff/checkin',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg> },
  { label: 'Messages',     href: '/staff/messages',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { label: 'Chat History', href: '/staff/chats',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
]

export default function StaffDashboard() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('Dashboard')

  useEffect(() => { fetchEvents() }, [])
  useEffect(() => { fetchParticipants() }, [selectedEvent])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, name, location, event_date, status, slot_limit')
      .in('status', ['published', 'ongoing', 'completed'])
      .order('event_date', { ascending: false })
    setEvents(data || [])
    if (data && data.length > 0) setSelectedEvent(data[0].id)
  }

  async function fetchParticipants() {
    setLoading(true)
    let query = supabase.from('v_participant_list').select('*')
    if (selectedEvent !== 'all') query = query.eq('event_id', selectedEvent)
    const { data } = await query.order('queue_number', { ascending: true, nullsFirst: false })
    setParticipants(data || [])
    setLoading(false)
  }

  const filtered = participants.filter(p => {
    const matchSearch = !search ||
      p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact_number?.includes(search) ||
      String(p.queue_number).includes(search)
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'checked_in' && p.checked_in_at) ||
      (filterStatus === 'not_checked_in' && !p.checked_in_at) ||
      (filterStatus === 'discharged' && p.discharged_at)
    const matchPayment = filterPayment === 'all' || p.payment_status === filterPayment
    const matchType = filterType === 'all' || p.registration_type === filterType
    return matchSearch && matchStatus && matchPayment && matchType
  })

  const currentEvent = events.find(e => e.id === selectedEvent)

  const stats = {
    total: filtered.length,
    checked_in: filtered.filter(p => p.checked_in_at).length,
    discharged: filtered.filter(p => p.discharged_at).length,
    paid: filtered.filter(p => p.payment_status === 'paid').length,
    total_collected: filtered.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.total_amount || 0), 0),
  }

  const inputStyle = {
    padding: '8px 12px', border: '1.5px solid #e8d5f0',
    borderRadius: 8, fontSize: 13, outline: 'none',
    fontFamily: 'inherit', color: '#1a1a1a',
    background: 'white', transition: 'border-color 0.15s'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: '#1a0a2e',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 40, flexShrink: 0
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/FUR.png" alt="Northern Hills" width={34} height={34} />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Northern Hills</div>
              <div style={{ color: '#39d353', fontSize: 9, letterSpacing: '0.1em', fontWeight: 600 }}>STAFF PANEL</div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {sideNav.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActiveNav(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px', fontSize: 13, fontWeight: 500,
                color: activeNav === item.label ? 'white' : 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                background: activeNav === item.label ? 'rgba(123,45,139,0.35)' : 'transparent',
                borderLeft: `3px solid ${activeNav === item.label ? '#7b2d8b' : 'transparent'}`,
                transition: 'all 0.15s', cursor: 'pointer'
              }}
            >
              <span style={{ opacity: activeNav === item.label ? 1 : 0.65 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/staff' }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s', padding: 0
            }}
          >
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
      <main style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOP BAR */}
        <header style={{
          background: 'white', height: 60,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px',
          borderBottom: '1px solid #ede8f3',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1a0a2e', margin: 0 }}>
              Participant Dashboard
            </h1>
            {currentEvent && (
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '4px 12px',
                borderRadius: 99, background: '#f5edf8', color: '#7b2d8b'
              }}>
                {currentEvent.location} · {new Date(currentEvent.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchParticipants}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', background: 'white', color: '#7b2d8b',
                border: '1.5px solid #e8d5f0', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <Link href="/staff/walkin" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: '#7b2d8b', color: 'white',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s', cursor: 'pointer'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Walk-In
            </Link>
            <Link href="/staff/checkin" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: '#1a0a2e', color: 'white',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s', cursor: 'pointer'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/>
              </svg>
              Scan QR
            </Link>
          </div>
        </header>

        <div style={{ padding: '24px 32px', flex: 1 }}>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Registrations', value: stats.total, sub: 'total for event', color: '#7b2d8b', bg: '#f5edf8', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { label: 'Checked In',   value: stats.checked_in, sub: `of ${stats.total}`, color: '#3b82f6', bg: '#eff6ff', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
              { label: 'Discharged',   value: stats.discharged, sub: 'completed', color: '#16a34a', bg: '#f0fdf4', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { label: 'Paid',         value: stats.paid, sub: `of ${stats.total}`, color: '#39d353', bg: 'rgba(57,211,83,0.08)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
              { label: 'Collected',    value: `₱${stats.total_collected.toLocaleString()}`, sub: 'total paid', color: '#d97706', bg: '#fff8f0', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            ].map(card => (
              <div key={card.label} style={{
                background: 'white', borderRadius: 12, padding: '16px 18px',
                border: '1px solid #ede8f3', boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {card.label.toUpperCase()}
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1a0a2e', lineHeight: 1, marginBottom: 4 }}>{card.value}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={{
            background: 'white', borderRadius: 12, padding: '16px 20px',
            border: '1px solid #ede8f3', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const
          }}>
            {/* Event selector */}
            <select
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              style={{ ...inputStyle, minWidth: 220 }}
            >
              <option value="all">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.location} — {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </option>
              ))}
            </select>

            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                placeholder="Search by name, contact, or queue no."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36, width: '100%', boxSizing: 'border-box' as const }}
              />
            </div>

            {/* Check-in filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
              <option value="all">All Status</option>
              <option value="checked_in">Checked In</option>
              <option value="not_checked_in">Not Checked In</option>
              <option value="discharged">Discharged</option>
            </select>

            {/* Payment filter */}
            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={inputStyle}>
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* Type filter */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
              <option value="all">All Types</option>
              <option value="pre_registered">Pre-Registered</option>
              <option value="walk_in">Walk-In</option>
            </select>

            {/* Clear filters */}
            {(search || filterStatus !== 'all' || filterPayment !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPayment('all'); setFilterType('all') }}
                style={{
                  padding: '8px 14px', background: '#fff0f0', color: '#ef4444',
                  border: '1px solid #fecaca', borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s'
                }}
              >Clear</button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>
              {filtered.length} of {participants.length} participants
            </div>
          </div>

          {/* TABLE */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #ede8f3',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                Loading participants...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>No participants found</div>
                <div style={{ fontSize: 13, color: '#aaa' }}>Try changing the filters or select a different event</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      {['Queue', 'Owner', 'Contact', 'Type', 'Pets', 'Check-In', 'Pre-Op', 'Post-Op', 'Payment', 'Chatbot', 'Actions'].map(col => (
                        <th key={col} style={{
                          textAlign: 'left', padding: '11px 14px',
                          fontSize: 11, fontWeight: 700, color: '#aaa',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: '1px solid #ede8f3', whiteSpace: 'nowrap'
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr
                        key={p.registration_id}
                        style={{
                          background: i % 2 === 0 ? 'white' : '#fafafa',
                          transition: 'background 0.15s'
                        }}
                      >
                        {/* Queue */}
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: p.queue_number ? '#1a0a2e' : '#f3f4f6',
                            color: p.queue_number ? 'white' : '#aaa',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800
                          }}>
                            {p.queue_number || '—'}
                          </div>
                        </td>

                        {/* Owner */}
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1a0a2e', marginBottom: 2 }}>{p.owner_name}</div>
                          <div style={{ fontSize: 11, color: '#aaa' }}>{p.email || '—'}</div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '13px 14px', color: '#555', whiteSpace: 'nowrap' }}>
                          {p.contact_number || '—'}
                        </td>

                        {/* Type */}
                        <td style={{ padding: '13px 14px' }}>
                          <Pill label={p.registration_type} />
                        </td>

                        {/* Pets */}
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a2e' }}>
                              {p.pet_count} pet{p.pet_count !== 1 ? 's' : ''}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {p.pets_complete > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a' }}>
                                  {p.pets_complete} done
                                </span>
                              )}
                              {p.pets_on_process > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: '#f5edf8', color: '#7b2d8b' }}>
                                  {p.pets_on_process} in progress
                                </span>
                              )}
                              {p.pets_rejected > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: '#fff0f0', color: '#ef4444' }}>
                                  {p.pets_rejected} rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Check-In */}
                        <td style={{ padding: '13px 14px' }}>
                          {p.checked_in_at ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 600, fontSize: 12 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Checked In
                              </div>
                              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                                {new Date(p.checked_in_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>Not yet</span>
                          )}
                        </td>

                        {/* Pre-Op */}
                        <td style={{ padding: '13px 14px' }}>
                          {p.registration_type === 'walk_in' ? (
                            <span style={{ fontSize: 11, color: '#ccc' }}>N/A</span>
                          ) : p.pre_op_sent ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Sent
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#d97706', fontSize: 12, fontWeight: 600 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              Pending
                            </div>
                          )}
                        </td>

                        {/* Post-Op */}
                        <td style={{ padding: '13px 14px' }}>
                          {p.post_op_sent ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Sent
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>Not sent</span>
                          )}
                        </td>

                        {/* Payment */}
                        <td style={{ padding: '13px 14px' }}>
                          {p.payment_status ? (
                            <div>
                              <Pill label={p.payment_status} />
                              {p.total_amount !== null && (
                                <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>
                                  ₱{Number(p.total_amount).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>—</span>
                          )}
                        </td>

                        {/* Chatbot */}
                        <td style={{ padding: '13px 14px' }}>
                          {p.chatbot_status ? (
                            <Pill label={p.chatbot_status} />
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Link
                              href={`/staff/participant/${p.registration_id}`}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', background: '#7b2d8b', color: 'white',
                                borderRadius: 7, textDecoration: 'none', fontSize: 12,
                                fontWeight: 600, transition: 'background 0.15s', cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                              View
                            </Link>
                            {!p.checked_in_at && (
  <button
    onClick={async () => {
      await supabase
        .from('registrations')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('id', p.registration_id)
      fetchParticipants()
    }}
    style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', background: '#39d353', color: 'white',
      borderRadius: 7, border: 'none', fontSize: 12,
      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background 0.15s', whiteSpace: 'nowrap'
    }}
  >Confirm</button>
)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}