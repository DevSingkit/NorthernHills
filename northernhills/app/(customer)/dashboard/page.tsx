// app/(customer)/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'



type OwnerProfile = {
  first_name: string
  last_name: string
  email: string
  contact_number: string
}

type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
  sex: string
  age_months: number | null
}

type Registration = {
  id: string
  queue_number: number | null
  registered_at: string
  checked_in_at: string | null
  discharged_at: string | null
  registration_type: string
  event: {
    name: string
    location: string
    event_date: string
    status: string
  }
  chatbot: { token: string; status: string } | null
  pets: {
    id: string
    name: string
    species: string
    sex: string
    pet_status: string
    procedure: string | null
  }[]
  billing: {
    total_amount: number
    procedure_fee: number
    medication_cost: number
    payment_status: string
    payment_method: string | null
  } | null
}

type Stats = {
  totalPets: number
  totalEvents: number
  completedProcedures: number
  totalBilled: number
  totalPaid: number
}

type Tab = 'overview' | 'events' | 'pets' | 'billing' | 'history'

export default function CustomerDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [stats, setStats] = useState<Stats>({ totalPets: 0, totalEvents: 0, completedProcedures: 0, totalBilled: 0, totalPaid: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { window.location.href = '/login'; return }

    const { data: account } = await supabase
      .from('accounts')
      .select('owner_id')
      .eq('auth_user_id', userData.user.id)
      .single()
    if (!account) return

    const ownerId = account.owner_id

    // Owner profile
    const { data: ownerData } = await supabase
      .from('owners')
      .select('first_name, last_name, email, contact_number')
      .eq('id', ownerId)
      .single()
    if (ownerData) setProfile(ownerData)

    // Pets
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name, species, breed, sex, age_months')
      .eq('owner_id', ownerId)
    setPets(petsData || [])

    // Registrations with nested data
    const { data: regsData } = await supabase
      .from('registrations')
      .select(`
        id, queue_number, registered_at, checked_in_at, discharged_at, registration_type,
        events (name, location, event_date, status),
        chatbot_sessions (session_token, status),
        registration_pets (
          id, pet_status,
          pets (name, species, sex),
          medical_records (procedure_performed)
        ),
        billing_records (total_amount, procedure_fee, medication_cost, payment_status, payment_method)
      `)
      .eq('owner_id', ownerId)
      .order('registered_at', { ascending: false })

    const formatted: Registration[] = (regsData || []).map((r: any) => ({
      id: r.id,
      queue_number: r.queue_number,
      registered_at: r.registered_at,
      checked_in_at: r.checked_in_at,
      discharged_at: r.discharged_at,
      registration_type: r.registration_type,
      event: r.events,
      chatbot: r.chatbot_sessions?.[0]
        ? { token: r.chatbot_sessions[0].session_token, status: r.chatbot_sessions[0].status }
        : null,
      pets: (r.registration_pets || []).map((rp: any) => ({
        id: rp.id,
        name: rp.pets?.name,
        species: rp.pets?.species,
        sex: rp.pets?.sex,
        pet_status: rp.pet_status,
        procedure: rp.medical_records?.[0]?.procedure_performed || null
      })),
      billing: r.billing_records?.[0] || null
    }))

    setRegistrations(formatted)

    // Compute stats
    const completed = formatted.filter(r => r.discharged_at)
    const totalBilled = formatted.reduce((s, r) => s + (r.billing?.total_amount || 0), 0)
    const totalPaid = formatted.filter(r => r.billing?.payment_status === 'paid').reduce((s, r) => s + (r.billing?.total_amount || 0), 0)
    const completedProcedures = formatted.flatMap(r => r.pets).filter(p => p.pet_status === 'complete').length

    setStats({
      totalPets: (petsData || []).length,
      totalEvents: formatted.length,
      completedProcedures,
      totalBilled,
      totalPaid
    })

    setLoading(false)
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: any = {
      complete: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
      on_process: { background: '#f5edf8', color: '#7b2d8b', border: '1px solid #e8d5f0' },
      rejected: { background: '#fff0f0', color: '#ef4444', border: '1px solid #fecaca' },
      paid: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
      unpaid: { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' },
      published: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
      ongoing: { background: '#f5edf8', color: '#7b2d8b', border: '1px solid #e8d5f0' },
      completed: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
      active: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
      expired: { background: '#f5f5f5', color: '#888', border: '1px solid #ddd' },
      not_started: { background: '#f5edf8', color: '#7b2d8b', border: '1px solid #e8d5f0' },
    }
    return { ...(map[s] || { background: '#f5f5f5', color: '#888', border: '1px solid #ddd' }), padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, display: 'inline-block' }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  const fmtPHP = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: tab === t ? 700 : 500,
    color: tab === t ? '#7b2d8b' : '#666',
    background: 'none',
    border: 'none',
    borderBottom: tab === t ? '2px solid #7b2d8b' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
  })

  const navLink = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    fontSize: 13,
    color: active ? 'white' : 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    background: active ? 'rgba(123,45,139,0.35)' : 'transparent',
    borderLeft: active ? '3px solid #7b2d8b' : '3px solid transparent',
    transition: 'all 0.15s'
  })

  const activeEvents = registrations.filter(r => !r.discharged_at && r.checked_in_at)
  const upcomingEvents = registrations.filter(r => !r.checked_in_at)
  const pastEvents = registrations.filter(r => r.discharged_at)

  const tabIcons: Record<Tab, React.ReactElement> = {
  overview: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  events: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pets: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
      <path d="M8 14v.5C8 17.519 9.787 21 12 21s4-3.481 4-6.5V14"/>
      <path d="M8.5 14c1.5 1 5.5 1 7 0"/>
    </svg>
  ),
  billing: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  history: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/>
      <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
      <polyline points="3 3 3 7 7 7"/>
    </svg>
  ),
}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#1a0a2e', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/hero.png" alt="logo" width={32} height={32} />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Northern Hills</div>
              <div style={{ fontSize: 10, color: '#39d353', letterSpacing: 1 }}>MY ACCOUNT</div>
            </div>
          </div>
        </div>

        {profile && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7b2d8b,#39d353)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{profile.first_name} {profile.last_name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2, wordBreak: 'break-all' }}>{profile.email}</div>
          </div>
        )}

        <nav style={{ flex: 1, paddingTop: 8 }}>
          {([['overview','Overview'], ['events','My Events'], ['pets','My Pets'], ['billing','Billing'], ['history','History']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
  ...navLink(tab === t),
  width: '100%', background: tab === t ? 'rgba(123,45,139,0.35)' : 'transparent',
  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
  textAlign: 'left', cursor: 'pointer',
  gap: 10, display: 'flex', alignItems: 'center'
}}>
              {tabIcons[t]}{label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 20 }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', cursor: 'pointer', fontSize: 12, padding: '6px 14px', borderRadius: 6, width: '100%', transition: 'all 0.15s' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1 }}>

        {/* HEADER */}
<header style={{ height: 60, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #ede8f3', position: 'sticky', top: 0, zIndex: 10 }}>
  <div>
    <div style={{ fontSize: 17, fontWeight: 800, color: '#1a0a2e' }}>
      {tab === 'overview' ? 'Dashboard' : tab === 'events' ? 'My Events' : tab === 'pets' ? 'My Pets' : tab === 'billing' ? 'Billing' : 'History'}
    </div>
  </div>
  <button onClick={() => router.push('/dashboard/events')} style={{ padding: '7px 16px', background: '#7b2d8b', color: 'white', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
    + Register for Event
  </button>
</header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#7b2d8b', fontSize: 14 }}>Loading...</div>
        ) : (
          <div style={{ padding: 28 }}>

            {/* ====== OVERVIEW ====== */}
            {tab === 'overview' && (
              <div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Total Pets', value: stats.totalPets, sub: 'registered', color: '#7b2d8b' },
                    { label: 'Events Joined', value: stats.totalEvents, sub: 'outreach events', color: '#2563eb' },
                    { label: 'Procedures Done', value: stats.completedProcedures, sub: 'completed', color: '#16a34a' },
                    { label: 'Total Billed', value: fmtPHP(stats.totalBilled), sub: `${fmtPHP(stats.totalPaid)} paid`, color: '#ea580c' },
                  ].map(c => (
                    <div key={c.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #ede8f3' }}>
                      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Pets */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #ede8f3' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#1a0a2e' }}>My Pets</div>
                    {pets.length === 0 ? <div style={{ fontSize: 13, color: '#aaa' }}>No pets registered yet.</div> : pets.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.species === 'cat' ? '#f5edf8' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {p.species === 'cat' ? '🐱' : '🐶'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{p.species} • {p.sex}{p.breed ? ` • ${p.breed}` : ''}</div>
                        </div>
                      </div>
                    ))}
                    {pets.length > 3 && <div style={{ fontSize: 12, color: '#7b2d8b', marginTop: 10, cursor: 'pointer' }} onClick={() => setTab('pets')}>View all {pets.length} pets →</div>}
                  </div>

                  <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #ede8f3' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#1a0a2e' }}>Recent Activity</div>
                    {registrations.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#aaa' }}>No events yet.</div>
                    ) : registrations.slice(0, 3).map(r => (
                      <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.event?.name}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>{r.event?.event_date ? fmt(r.event.event_date) : ''} • {r.pets.length} pet(s)</div>
                          </div>
                          <span style={statusStyle(r.discharged_at ? 'complete' : r.checked_in_at ? 'ongoing' : 'not_started')}>
                            {r.discharged_at ? 'Done' : r.checked_in_at ? 'Ongoing' : 'Upcoming'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {registrations.length > 3 && <div style={{ fontSize: 12, color: '#7b2d8b', marginTop: 10, cursor: 'pointer' }} onClick={() => setTab('events')}>View all →</div>}
                  </div>
                </div>

                {/* Chatbot sessions */}
                {registrations.some(r => r.chatbot) && (
                  <div style={{ background: 'linear-gradient(120deg,#1a0a2e,#2d1050)', borderRadius: 12, padding: 20, marginTop: 16, border: '1px solid rgba(123,45,139,0.3)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 12 }}>Post-Op Chat Sessions</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {registrations.filter(r => r.chatbot).map(r => (
                        <div key={r.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{r.event?.name}</div>
                          <div style={{ marginTop: 4, marginBottom: 10 }}>
                            <span style={statusStyle(r.chatbot!.status)}>{r.chatbot!.status.replace('_', ' ')}</span>
                          </div>
                          {r.chatbot!.status !== 'expired' && (
                            <Link href={`/chatbot/${r.chatbot!.token}`} style={{ fontSize: 12, color: '#39d353', textDecoration: 'none', fontWeight: 600 }}>
                              Open Chat →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== EVENTS ====== */}
            {tab === 'events' && (
              <div>
                {upcomingEvents.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e', marginBottom: 12 }}>Upcoming / Registered</div>
                    {upcomingEvents.map(r => <EventCard key={r.id} r={r} fmt={fmt} fmtPHP={fmtPHP} statusStyle={statusStyle} />)}
                  </div>
                )}
                {activeEvents.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e', marginBottom: 12 }}>Active / Check-In</div>
                    {activeEvents.map(r => <EventCard key={r.id} r={r} fmt={fmt} fmtPHP={fmtPHP} statusStyle={statusStyle} />)}
                  </div>
                )}
                {pastEvents.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e', marginBottom: 12 }}>Completed</div>
                    {pastEvents.map(r => <EventCard key={r.id} r={r} fmt={fmt} fmtPHP={fmtPHP} statusStyle={statusStyle} />)}
                  </div>
                )}
                {registrations.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: '#aaa', fontSize: 14 }}>No events yet. <Link href="/register" style={{ color: '#7b2d8b' }}>Register for one →</Link></div>
                )}
              </div>
            )}

            {/* ====== PETS ====== */}
            {tab === 'pets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {pets.length === 0 && (
                  <div style={{ color: '#aaa', fontSize: 14, gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>No pets registered yet.</div>
                )}
                {pets.map(p => {
                  const petRegs = registrations.filter(r => r.pets.some(rp => rp.name === p.name))
                  const lastReg = petRegs[0]
                  const petEntry = lastReg?.pets.find(rp => rp.name === p.name)
                  return (
                    <div key={p.id} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #ede8f3' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: p.species === 'cat' ? '#f5edf8' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                          {p.species === 'cat' ? '🐱' : '🐶'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{p.species} • {p.sex}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                        {p.breed && <div><span style={{ color: '#aaa' }}>Breed</span><br /><b>{p.breed}</b></div>}
                        {p.age_months && <div><span style={{ color: '#aaa' }}>Age</span><br /><b>{p.age_months} months</b></div>}
                        <div><span style={{ color: '#aaa' }}>Events</span><br /><b>{petRegs.length}</b></div>
                      </div>
                      {petEntry && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f5f5f5' }}>
                          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Last status</div>
                          <span style={statusStyle(petEntry.pet_status)}>{petEntry.pet_status.replace('_', ' ')}</span>
                          {petEntry.procedure && <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{petEntry.procedure}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ====== BILLING ====== */}
            {tab === 'billing' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Total Billed', value: fmtPHP(stats.totalBilled), color: '#1a0a2e' },
                    { label: 'Total Paid', value: fmtPHP(stats.totalPaid), color: '#16a34a' },
                    { label: 'Outstanding', value: fmtPHP(stats.totalBilled - stats.totalPaid), color: '#ea580c' },
                  ].map(c => (
                    <div key={c.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #ede8f3' }}>
                      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{c.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #ede8f3', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8f5fc', borderBottom: '1px solid #ede8f3' }}>
                        {['Event', 'Date', 'Pets', 'Procedure Fee', 'Medication', 'Total', 'Status', 'Method'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.billing).map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.event?.name}</td>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{r.event?.event_date ? fmt(r.event.event_date) : '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{r.pets.length}</td>
                          <td style={{ padding: '12px 16px' }}>{fmtPHP(r.billing!.procedure_fee)}</td>
                          <td style={{ padding: '12px 16px' }}>{fmtPHP(r.billing!.medication_cost)}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{fmtPHP(r.billing!.total_amount)}</td>
                          <td style={{ padding: '12px 16px' }}><span style={statusStyle(r.billing!.payment_status)}>{r.billing!.payment_status}</span></td>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{r.billing!.payment_method || '—'}</td>
                        </tr>
                      ))}
                      {registrations.filter(r => r.billing).length === 0 && (
                        <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>No billing records yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ====== HISTORY ====== */}
            {tab === 'history' && (
              <div>
                {registrations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: '#aaa', fontSize: 14 }}>No history yet.</div>
                ) : registrations.map(r => (
                  <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 14, border: '1px solid #ede8f3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.event?.name}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          {r.event?.location} • {r.event?.event_date ? fmt(r.event.event_date) : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={statusStyle(r.registration_type === 'walk_in' ? 'not_started' : 'published')}>{r.registration_type.replace('_', '-')}</span>
                        <span style={statusStyle(r.discharged_at ? 'complete' : r.checked_in_at ? 'ongoing' : 'not_started')}>
                          {r.discharged_at ? 'Completed' : r.checked_in_at ? 'Ongoing' : 'Upcoming'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, fontSize: 12, marginBottom: 12 }}>
                      <div><span style={{ color: '#aaa' }}>Queue #</span><br /><b>{r.queue_number ?? '—'}</b></div>
                      <div><span style={{ color: '#aaa' }}>Registered</span><br /><b>{fmt(r.registered_at)}</b></div>
                      <div><span style={{ color: '#aaa' }}>Check-in</span><br /><b>{r.checked_in_at ? fmt(r.checked_in_at) : '—'}</b></div>
                      <div><span style={{ color: '#aaa' }}>Discharged</span><br /><b>{r.discharged_at ? fmt(r.discharged_at) : '—'}</b></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: r.chatbot ? 12 : 0 }}>
                      {r.pets.map(p => (
                        <div key={p.id} style={{ background: '#fafafa', borderRadius: 8, padding: '6px 12px', fontSize: 12, border: '1px solid #ede8f3' }}>
                          <b>{p.name}</b> ({p.species}) — <span style={statusStyle(p.pet_status)}>{p.pet_status.replace('_', ' ')}</span>
                          {p.procedure && <span style={{ color: '#666', marginLeft: 6 }}>{p.procedure}</span>}
                        </div>
                      ))}
                    </div>

                    {r.chatbot && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={statusStyle(r.chatbot.status)}>Chat: {r.chatbot.status.replace('_', ' ')}</span>
                        {r.chatbot.status !== 'expired' && (
                          <Link href={`/chatbot/${r.chatbot.token}`} style={{ fontSize: 12, color: '#7b2d8b', textDecoration: 'none', fontWeight: 600 }}>Open Post-Op Chat →</Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}

// Shared Event Card component
function EventCard({ r, fmt, fmtPHP, statusStyle }: {
  r: Registration
  fmt: (d: string) => string
  fmtPHP: (n: number) => string
  statusStyle: (s: string) => React.CSSProperties
}) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid #ede8f3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.event?.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.event?.location} • {r.event?.event_date ? fmt(r.event.event_date) : ''}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {r.queue_number && <span style={{ fontSize: 12, fontWeight: 700, color: '#7b2d8b' }}>Queue #{r.queue_number}</span>}
          <span style={statusStyle(r.discharged_at ? 'complete' : r.checked_in_at ? 'ongoing' : 'not_started')}>
            {r.discharged_at ? 'Completed' : r.checked_in_at ? 'Ongoing' : 'Upcoming'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {r.pets.map(p => (
          <div key={p.id} style={{ background: '#fafafa', borderRadius: 8, padding: '6px 12px', fontSize: 12, border: '1px solid #ede8f3' }}>
            <b>{p.name}</b> — <span style={statusStyle(p.pet_status)}>{p.pet_status.replace('_', ' ')}</span>
            {p.procedure && <span style={{ color: '#666', marginLeft: 6 }}>• {p.procedure}</span>}
          </div>
        ))}
      </div>

      {r.billing && (
        <div style={{ display: 'flex', gap: 16, fontSize: 12, paddingTop: 10, borderTop: '1px solid #f5f5f5', alignItems: 'center' }}>
          <div><span style={{ color: '#aaa' }}>Total: </span><b>{fmtPHP(r.billing.total_amount)}</b></div>
          <span style={statusStyle(r.billing.payment_status)}>{r.billing.payment_status}</span>
          {r.billing.payment_method && <span style={{ color: '#aaa' }}>via {r.billing.payment_method}</span>}
        </div>
      )}

      {r.chatbot?.token && r.chatbot.status !== 'expired' && (
        <div style={{ marginTop: 10 }}>
          <Link href={`/chatbot/${r.chatbot.token}`} style={{ fontSize: 12, color: '#7b2d8b', textDecoration: 'none', fontWeight: 600 }}>
            Open Post-Op Chat →
          </Link>
        </div>
      )}
    </div>
  )
}