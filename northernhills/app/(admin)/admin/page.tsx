'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type EventSummary = {
  event_id: string
  event_name: string
  location: string
  event_date: string
  event_status: string
  total_registrations: number
  total_checked_in: number
  total_discharged: number
  total_pets: number
  total_complete: number
  total_rejected: number
  total_collected: number
  total_paid: number
  total_unpaid: number
}

type Stats = {
  total_owners: number
  total_pets: number
  total_events: number
  total_staff: number
  total_collected: number
  total_paid: number
  total_unpaid: number
  dogs: number
  cats: number
  active_sessions: number
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

export default function AdminDashboard() {
  const [active, setActive] = useState('Dashboard')
  const [period, setPeriod] = useState('today')
  const [events, setEvents] = useState<EventSummary[]>([])
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [stats, setStats] = useState<Stats>({
    total_owners: 0, total_pets: 0, total_events: 0,
    total_staff: 0, total_collected: 0, total_paid: 0,
    total_unpaid: 0, dogs: 0, cats: 0, active_sessions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [period, selectedEvent])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchEvents()])
    setLoading(false)
  }

  async function fetchStats() {
    const [
      { count: owners },
      { count: pets },
      { count: eventsCount },
      { count: staff },
      { data: billing },
      { count: dogs },
      { count: cats },
      { count: activeSessions },
    ] = await Promise.all([
      supabase.from('owners').select('*', { count: 'exact', head: true }),
      supabase.from('pets').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('staff_accounts').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('billing_records').select('total_amount, payment_status'),
      supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'dog'),
      supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'cat'),
      supabase.from('chatbot_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    const totalCollected = billing?.reduce((s, b) => s + (b.total_amount || 0), 0) || 0
    const totalPaid = billing?.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0) || 0

    setStats({
      total_owners: owners || 0,
      total_pets: pets || 0,
      total_events: eventsCount || 0,
      total_staff: staff || 0,
      total_collected: totalCollected,
      total_paid: totalPaid,
      total_unpaid: totalCollected - totalPaid,
      dogs: dogs || 0,
      cats: cats || 0,
      active_sessions: activeSessions || 0,
    })
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from('v_event_summary')
      .select('*')
      .order('event_date', { ascending: false })
      .limit(10)
    setEvents(data || [])
  }

  const dogPct  = stats.total_pets > 0 ? Math.round((stats.dogs / stats.total_pets) * 100) : 0
  const catPct  = stats.total_pets > 0 ? Math.round((stats.cats / stats.total_pets) * 100) : 0
  const payRate = stats.total_collected > 0 ? Math.round((stats.total_paid / stats.total_collected) * 100) : 0

  // Donut chart math
  const r = 54, cx = 70, cy = 70
  const circ = 2 * Math.PI * r
  const dogDash = (dogPct / 100) * circ
  const catDash = (catPct / 100) * circ

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>

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

      {/* ── MAIN ── */}
      <main style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{
          background: 'white', height: 60,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid #ede8f3',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a0a2e', margin: 0 }}>Dashboard</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Period filter */}
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                padding: '7px 12px', border: '1.5px solid #e8d5f0',
                borderRadius: 8, fontSize: 13, color: '#1a0a2e',
                background: 'white', cursor: 'pointer', outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>

            {/* Event filter */}
            <select
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              style={{
                padding: '7px 12px', border: '1.5px solid #e8d5f0',
                borderRadius: 8, fontSize: 13, color: '#1a0a2e',
                background: 'white', cursor: 'pointer', outline: 'none',
                fontFamily: 'inherit', maxWidth: 200
              }}
            >
              <option value="all">All Events</option>
              {events.map(ev => (
                <option key={ev.event_id} value={ev.event_id}>
                  {ev.location} — {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchAll}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', background: '#7b2d8b', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>

            {/* New Event */}
            <Link href="/admin/events" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', background: '#1a0a2e', color: 'white',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s', cursor: 'pointer'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Event
            </Link>
          </div>
        </header>

        <div style={{ padding: '28px 32px', flex: 1 }}>

          {loading && (
            <div style={{
              textAlign: 'center', padding: '48px 0',
              color: '#aaa', fontSize: 14
            }}>Loading dashboard data...</div>
          )}

          {!loading && <>

            {/* ── STAT CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                {
                  label: 'Total Registrations',
                  value: stats.total_owners,
                  sub: `${stats.total_pets} pets registered`,
                  color: '#ef4444', bg: '#fff5f5',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                },
                {
                  label: 'Total Pets Served',
                  value: stats.total_pets,
                  sub: `${stats.dogs} dogs · ${stats.cats} cats`,
                  color: '#39d353', bg: '#f0fdf4',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                },
                {
                  label: 'Period Revenue',
                  value: `₱${stats.total_paid.toLocaleString()}`,
                  sub: `₱${stats.total_unpaid.toLocaleString()} outstanding`,
                  color: '#7b2d8b', bg: '#f5edf8',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                },
                {
                  label: 'Active Staff',
                  value: stats.total_staff,
                  sub: `${stats.total_events} total events`,
                  color: '#3b82f6', bg: '#eff6ff',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                },
              ].map(card => (
                <div key={card.label} style={{
                  background: 'white', borderRadius: 12,
                  padding: '20px 22px',
                  border: '1px solid #ede8f3',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {card.label.toUpperCase()}
                    </div>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: card.bg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>{card.icon}</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#1a0a2e', lineHeight: 1, marginBottom: 6 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* ── TABS ── */}
            <div style={{
              background: 'white', borderRadius: 12,
              border: '1px solid #ede8f3',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              marginBottom: 24, overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex', borderBottom: '1px solid #ede8f3',
                background: '#fafafa', padding: '0 4px'
              }}>
                {['Overview', 'Events', 'Finance', 'Chatbot'].map((tab, i) => (
                  <button
                    key={tab}
                    style={{
                      padding: '12px 20px', border: 'none',
                      background: i === 0 ? 'white' : 'transparent',
                      fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? '#7b2d8b' : '#888',
                      cursor: 'pointer', fontFamily: 'inherit',
                      borderBottom: i === 0 ? '2px solid #7b2d8b' : '2px solid transparent',
                      transition: 'all 0.15s'
                    }}
                  >{tab}</button>
                ))}
              </div>

              {/* Overview tab content */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

                  {/* Today's Events */}
                  <div style={{ borderRadius: 10, border: '1px solid #ede8f3', padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>
                      Upcoming Events
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>
                      {events.filter(e => e.event_status === 'published').length} scheduled
                    </div>
                    {events.filter(e => ['published', 'ongoing'].includes(e.event_status)).slice(0, 3).length === 0 ? (
                      <p style={{ color: '#bbb', fontSize: 13, margin: 0 }}>No upcoming events</p>
                    ) : (
                      events.filter(e => ['published', 'ongoing'].includes(e.event_status)).slice(0, 3).map(ev => (
                        <div key={ev.event_id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', padding: '10px 0',
                          borderBottom: '1px solid #f5f5f5'
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a2e' }}>{ev.location}</div>
                            <div style={{ fontSize: 11, color: '#aaa' }}>
                              {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 99,
                            background: ev.event_status === 'ongoing' ? 'rgba(57,211,83,0.12)' : '#f5edf8',
                            color: ev.event_status === 'ongoing' ? '#16a34a' : '#7b2d8b'
                          }}>
                            {ev.event_status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pet Distribution donut */}
                  <div style={{ borderRadius: 10, border: '1px solid #ede8f3', padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>
                      Pet Distribution
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>By species</div>

                    {stats.total_pets === 0 ? (
                      <p style={{ color: '#bbb', fontSize: 13 }}>No pet data yet</p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <svg width="140" height="140" viewBox="0 0 140 140">
                          {/* Background ring */}
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0eaf5" strokeWidth="18"/>
                          {/* Dogs — purple */}
                          <circle
                            cx={cx} cy={cy} r={r}
                            fill="none" stroke="#7b2d8b" strokeWidth="18"
                            strokeDasharray={`${dogDash} ${circ}`}
                            strokeDashoffset={circ * 0.25}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.5s' }}
                          />
                          {/* Cats — green */}
                          <circle
                            cx={cx} cy={cy} r={r}
                            fill="none" stroke="#39d353" strokeWidth="18"
                            strokeDasharray={`${catDash} ${circ}`}
                            strokeDashoffset={circ * 0.25 - dogDash}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.5s' }}
                          />
                          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a0a2e">{stats.total_pets}</text>
                          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#aaa">total</text>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7b2d8b' }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e' }}>Dog: {dogPct}%</div>
                              <div style={{ fontSize: 11, color: '#aaa' }}>{stats.dogs} pets</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#39d353' }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e' }}>Cat: {catPct}%</div>
                              <div style={{ fontSize: 11, color: '#aaa' }}>{stats.cats} pets</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alerts */}
                  <div style={{ borderRadius: 10, border: '1px solid #ede8f3', padding: '18px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>Alerts</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>Items needing attention</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8,
                        background: stats.total_unpaid > 0 ? '#fff8f0' : '#f0fdf4',
                        border: `1px solid ${stats.total_unpaid > 0 ? '#fde8c8' : 'rgba(57,211,83,0.2)'}`
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={stats.total_unpaid > 0 ? '#d97706' : '#39d353'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={{ fontSize: 12, color: stats.total_unpaid > 0 ? '#d97706' : '#16a34a', fontWeight: 500 }}>
                          {stats.total_unpaid > 0 ? `₱${stats.total_unpaid.toLocaleString()} unpaid bills` : 'All bills settled'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8,
                        background: '#f5edf8', border: '1px solid #e8d5f0'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span style={{ fontSize: 12, color: '#7b2d8b', fontWeight: 500 }}>
                          {stats.active_sessions} active chatbot sessions
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8,
                        background: '#eff6ff', border: '1px solid #bfdbfe'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500 }}>
                          {events.filter(e => e.event_status === 'published').length} upcoming events
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FINANCIAL SUMMARY ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{
                background: 'white', borderRadius: 12,
                border: '1px solid #ede8f3', padding: '24px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>Financial Summary</div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>For the selected period</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Total Billed',   value: `₱${stats.total_collected.toLocaleString()}`, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Total Paid',      value: `₱${stats.total_paid.toLocaleString()}`,      color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Outstanding',     value: `₱${stats.total_unpaid.toLocaleString()}`,    color: '#d97706', bg: '#fff8f0' },
                    { label: 'Payment Rate',    value: `${payRate}%`,                                 color: '#7b2d8b', bg: '#f5edf8' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: item.bg, borderRadius: 10,
                      padding: '16px 20px'
                    }}>
                      <div style={{ fontSize: 11, color: item.color, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>
                        {item.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} />
                    Paid
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706' }} />
                    Outstanding
                  </div>
                </div>
              </div>

              {/* Recent events */}
              <div style={{
                background: 'white', borderRadius: 12,
                border: '1px solid #ede8f3', padding: '24px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>Recent Events</div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>Latest outreach activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.slice(0, 4).map(ev => (
                    <div key={ev.event_id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', paddingBottom: 12,
                      borderBottom: '1px solid #f5f5f5'
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a2e', marginBottom: 2 }}>{ev.location}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>
                          {ev.total_complete} completed · ₱{Number(ev.total_paid).toLocaleString()}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '3px 8px', borderRadius: 99,
                        background: ev.event_status === 'completed' ? '#f0fdf4'
                          : ev.event_status === 'ongoing' ? '#f5edf8' : '#f3f4f6',
                        color: ev.event_status === 'completed' ? '#16a34a'
                          : ev.event_status === 'ongoing' ? '#7b2d8b' : '#888'
                      }}>
                        {ev.event_status.charAt(0).toUpperCase() + ev.event_status.slice(1)}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p style={{ color: '#bbb', fontSize: 13, margin: 0 }}>No events yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── EVENT TABLE ── */}
            <div style={{
              background: 'white', borderRadius: 12,
              border: '1px solid #ede8f3',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #ede8f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>All Events</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Overview of all outreach events</div>
                </div>
                <Link href="/admin/events" style={{
                  fontSize: 13, color: '#7b2d8b', fontWeight: 600,
                  textDecoration: 'none', transition: 'opacity 0.15s', cursor: 'pointer'
                }}>View All →</Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      {['Location', 'Date', 'Registrations', 'Checked In', 'Completed', 'Rejected', 'Collected', 'Status'].map(col => (
                        <th key={col} style={{
                          textAlign: 'left', padding: '11px 16px',
                          fontSize: 11, fontWeight: 700, color: '#aaa',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: '1px solid #ede8f3', whiteSpace: 'nowrap'
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
                          No events found
                        </td>
                      </tr>
                    ) : events.map((ev, i) => (
                      <tr key={ev.event_id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.15s' }}>
                        <td style={{ padding: '13px 16px', color: '#1a0a2e', fontWeight: 600 }}>{ev.location}</td>
                        <td style={{ padding: '13px 16px', color: '#555', whiteSpace: 'nowrap' }}>
                          {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 16px', color: '#555' }}>{ev.total_registrations}</td>
                        <td style={{ padding: '13px 16px', color: '#555' }}>{ev.total_checked_in}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>{ev.total_complete}</span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ color: ev.total_rejected > 0 ? '#ef4444' : '#aaa', fontWeight: ev.total_rejected > 0 ? 700 : 400 }}>
                            {ev.total_rejected}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#7b2d8b', fontWeight: 700 }}>
                          ₱{Number(ev.total_paid).toLocaleString()}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                            background: ev.event_status === 'completed' ? '#f0fdf4'
                              : ev.event_status === 'ongoing' ? '#f5edf8'
                              : ev.event_status === 'published' ? '#eff6ff'
                              : '#f3f4f6',
                            color: ev.event_status === 'completed' ? '#16a34a'
                              : ev.event_status === 'ongoing' ? '#7b2d8b'
                              : ev.event_status === 'published' ? '#3b82f6'
                              : '#888'
                          }}>
                            {ev.event_status.charAt(0).toUpperCase() + ev.event_status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>}
        </div>
      </main>
    </div>
  )
}