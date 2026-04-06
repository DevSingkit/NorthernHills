'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type EventDetail = {
  id: string
  event_name: string
  event_date: string
  barangay: string
  venue_address: string
  max_slots: number
  event_status: string
  total_registrations: number
  total_pets: number
  checked_in_count: number
  completed_count: number
  total_billed: number
  total_paid: number
}

type Participant = {
  registration_id: string
  owner_name: string
  contact_number: string
  email: string
  queue_number: number | null
  registration_type: string
  checked_in_at: string | null
  pet_count: number
  completed_pets: number
  total_pets: number
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [stats, setStats] = useState({
    dogs: 0,
    cats: 0,
    male: 0,
    female: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'finance'>('overview')

  useEffect(() => {
    fetchEventDetails()
    fetchParticipants()
    fetchPetStats()
  }, [eventId])

  async function fetchEventDetails() {
    const { data, error } = await supabase
      .from('v_event_summary')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
    } else {
      setEvent(data)
    }
  }

  async function fetchParticipants() {
    const { data, error } = await supabase
      .from('v_participant_list')
      .select('*')
      .eq('event_id', eventId)
      .order('queue_number', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching participants:', error)
    } else {
      setParticipants(data || [])
    }
    setLoading(false)
  }

  async function fetchPetStats() {
  const { data: pets } = await supabase
    .from('registration_pets')
    .select(`
      pets (species, sex),
      registrations!inner (event_id)
    `)
    .eq('registrations.event_id', eventId)

  if (pets) {
    const dogs = pets.filter((p: any) => p.pets?.species === 'dog').length
    const cats = pets.filter((p: any) => p.pets?.species === 'cat').length
    const male = pets.filter((p: any) => p.pets?.sex === 'male').length
    const female = pets.filter((p: any) => p.pets?.sex === 'female').length
    setStats({ dogs, cats, male, female })
  }
}

  if (loading || !event) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          Loading event details...
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Registrations',
      value: event.total_registrations,
      subtext: `${event.max_slots - event.total_registrations} slots remaining`,
      color: '#7b2d8b'
    },
    {
      label: 'Checked In',
      value: event.checked_in_count,
      subtext: `${Math.round((event.checked_in_count / event.total_registrations) * 100)}% arrived`,
      color: '#3b82f6'
    },
    {
      label: 'Completed',
      value: event.completed_count,
      subtext: `${event.total_pets} total pets`,
      color: '#39d353'
    },
    {
      label: 'Revenue',
      value: `₱${event.total_billed?.toLocaleString() || 0}`,
      subtext: `₱${event.total_paid?.toLocaleString() || 0} collected`,
      color: '#f59e0b'
    }
  ]

  const statusColors: Record<string, any> = {
    draft: { bg: '#f0f0f0', text: '#666' },
    published: { bg: '#e8f5e9', text: '#2e7d32' },
    ongoing: { bg: '#e3f2fd', text: '#1565c0' },
    completed: { bg: '#f3e5f5', text: '#7b1fa2' },
    cancelled: { bg: '#ffebee', text: '#c62828' }
  }

  const sc = statusColors[event.event_status] || statusColors.draft

  return (
    <div style={{
      minHeight: '100vh', background: '#fafafa',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 240, background: '#1a0a2e',
        padding: '24px 0', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Northern Hills</div>
          <div style={{ color: '#39d353', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600 }}>
            ADMIN PANEL
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Events', href: '/admin/events' },
            { label: 'Staff', href: '/admin/staff' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Chats', href: '/admin/chats' }
          ].map(item => (
            <Link key={item.label} href={item.href} style={{
              padding: '10px 16px', borderRadius: 8,
              background: item.label === 'Events' ? 'rgba(123,45,139,0.15)' : 'transparent',
              border: item.label === 'Events' ? '1px solid rgba(123,45,139,0.3)' : '1px solid transparent',
              color: item.label === 'Events' ? '#39d353' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none', fontSize: 14, fontWeight: item.label === 'Events' ? 600 : 500,
              transition: 'all 0.15s', cursor: 'pointer'
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0 20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <Link href="/login" style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
            textDecoration: 'none', fontWeight: 500
          }}>Sign Out</Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 240, padding: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/admin/events" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#7b2d8b', fontSize: 14, fontWeight: 600,
            textDecoration: 'none', marginBottom: 16
          }}>
            ← Back to Events
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a0a2e', margin: 0 }}>
                  {event.event_name}
                </h1>
                <span style={{
                  background: sc.bg, color: sc.text,
                  padding: '4px 12px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {event.event_status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600 }}>📅</span>
                  {new Date(event.event_date).toLocaleDateString('en-PH', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600 }}>📍</span>
                  {event.barangay}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                {event.venue_address}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{
                background: 'white', color: '#7b2d8b',
                border: '1.5px solid #e8d5f0', padding: '10px 20px',
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
              }}>
                Export List
              </button>
              <button style={{
                background: '#7b2d8b', color: 'white',
                border: 'none', padding: '10px 20px',
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
              }}>
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20, marginBottom: 32
        }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: 'white', borderRadius: 14,
              padding: 24, border: '1.5px solid #e8d5f0'
            }}>
              <div style={{ fontSize: 12, color: '#999', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                {card.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: card.color, marginBottom: 4 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: '#aaa' }}>
                {card.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div style={{
          background: 'white', borderRadius: '14px 14px 0 0',
          border: '1.5px solid #e8d5f0', borderBottom: 'none',
          padding: '0 24px', display: 'flex', gap: 32
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'participants', label: 'Participants' },
            { id: 'finance', label: 'Finance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none', border: 'none',
                padding: '16px 0', fontSize: 14, fontWeight: 600,
                color: activeTab === tab.id ? '#7b2d8b' : '#999',
                borderBottom: activeTab === tab.id ? '2px solid #7b2d8b' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white', borderRadius: '0 0 14px 14px',
          border: '1.5px solid #e8d5f0', padding: 32
        }}>
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a0a2e', marginBottom: 24 }}>
                Pet Distribution
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Species */}
                <div>
                  <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 16 }}>
                    By Species
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: 16,
                      background: '#fafafa', borderRadius: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🐶</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>Dogs</span>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#7b2d8b' }}>
                        {stats.dogs}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: 16,
                      background: '#fafafa', borderRadius: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 24 }}>🐱</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>Cats</span>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#7b2d8b' }}>
                        {stats.cats}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sex */}
                <div>
                  <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 16 }}>
                    By Sex
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: 16,
                      background: '#fafafa', borderRadius: 10
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>Male</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>
                        {stats.male}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: 16,
                      background: '#fafafa', borderRadius: 10
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>Female</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#ec4899' }}>
                        {stats.female}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 32, padding: 20,
                background: '#f5edf8', borderRadius: 12,
                border: '1px solid #e8d5f0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#7b2d8b', marginBottom: 8 }}>
                  Event Capacity
                </div>
                <div style={{
                  background: '#e8d5f0', borderRadius: 8,
                  height: 12, overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#7b2d8b', height: '100%',
                    width: `${(event.total_registrations / event.max_slots) * 100}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  {event.total_registrations} / {event.max_slots} slots filled
                  ({Math.round((event.total_registrations / event.max_slots) * 100)}%)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a0a2e', marginBottom: 24 }}>
                Participant List ({participants.length})
              </h3>

              {participants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  No registrations yet
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #e8d5f0' }}>
                        {['Queue', 'Owner', 'Contact', 'Type', 'Pets', 'Status'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '12px 16px',
                            fontSize: 11, fontWeight: 700, color: '#666',
                            letterSpacing: '0.06em', textTransform: 'uppercase'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map(p => (
                        <tr key={p.registration_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#7b2d8b' }}>
                            {p.queue_number ? `#${p.queue_number}` : '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a0a2e' }}>
                              {p.owner_name}
                            </div>
                            {p.email && (
                              <div style={{ fontSize: 12, color: '#999' }}>{p.email}</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>
                            {p.contact_number}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: p.registration_type === 'pre_registered' ? '#e8f5e9' : '#fff3e0',
                              color: p.registration_type === 'pre_registered' ? '#2e7d32' : '#f57c00',
                              padding: '4px 10px', borderRadius: 6,
                              fontSize: 11, fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              {p.registration_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>
                            {p.completed_pets}/{p.total_pets}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: p.checked_in_at ? '#e3f2fd' : '#f5f5f5',
                              color: p.checked_in_at ? '#1565c0' : '#999',
                              padding: '4px 10px', borderRadius: 6,
                              fontSize: 11, fontWeight: 600
                            }}>
                              {p.checked_in_at ? 'Checked In' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'finance' && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a0a2e', marginBottom: 24 }}>
                Financial Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div style={{
                  padding: 20, background: '#fafafa', borderRadius: 12,
                  border: '1px solid #e8d5f0'
                }}>
                  <div style={{ fontSize: 12, color: '#999', fontWeight: 600, marginBottom: 8 }}>
                    TOTAL BILLED
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#1a0a2e' }}>
                    ₱{event.total_billed?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{
                  padding: 20, background: '#e8f5e9', borderRadius: 12,
                  border: '1px solid #81c784'
                }}>
                  <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600, marginBottom: 8 }}>
                    TOTAL PAID
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#2e7d32' }}>
                    ₱{event.total_paid?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{
                  padding: 20, background: '#fff3e0', borderRadius: 12,
                  border: '1px solid #ffb74d'
                }}>
                  <div style={{ fontSize: 12, color: '#f57c00', fontWeight: 600, marginBottom: 8 }}>
                    OUTSTANDING
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#f57c00' }}>
                    ₱{((event.total_billed || 0) - (event.total_paid || 0)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 24, padding: 20,
                background: '#f5edf8', borderRadius: 12,
                border: '1px solid #e8d5f0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#7b2d8b', marginBottom: 12 }}>
                  Collection Rate
                </div>
                <div style={{
                  background: '#e8d5f0', borderRadius: 8,
                  height: 12, overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#39d353', height: '100%',
                    width: `${event.total_billed ? ((event.total_paid || 0) / event.total_billed) * 100 : 0}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  {event.total_billed ? Math.round(((event.total_paid || 0) / event.total_billed) * 100) : 0}% collected
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}