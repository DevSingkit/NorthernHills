// app/(customer)/dashboard/events/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  event_name: string
  event_date: string
  barangay: string
  venue_address: string
  max_slots: number
  event_status: string
}

type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
  sex: string
  age_months: number | null
}

type Step = 'events' | 'pets' | 'confirm' | 'done'

export default function CustomerEventsPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([])
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrToken, setQrToken] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { router.push('/login'); return }

    const { data: account } = await supabase
      .from('accounts')
      .select('owner_id')
      .eq('auth_user_id', userData.user.id)
      .single()
    if (!account) return

    setOwnerId(account.owner_id)

    const [{ data: eventsData }, { data: petsData }] = await Promise.all([
      supabase
        .from('events')
        .select('id, event_name, event_date, barangay, venue_address, max_slots, event_status')
        .eq('event_status', 'published')
        .order('event_date', { ascending: true }),
      supabase
        .from('pets')
        .select('id, name, species, breed, sex, age_months')
        .eq('owner_id', account.owner_id)
    ])

    setEvents(eventsData || [])
    setPets(petsData || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!ownerId || !selectedEvent || selectedPetIds.length === 0) return
    setSubmitting(true)
    setError('')

    // Check for existing registration
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('event_id', selectedEvent.id)
      .single()

    if (existing) {
      setError('You are already registered for this event.')
      setSubmitting(false)
      return
    }

    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert([{ owner_id: ownerId, event_id: selectedEvent.id, registration_type: 'pre_registered' }])
      .select()
      .single()

    if (regError) { setError(regError.message); setSubmitting(false); return }

    const regPets = selectedPetIds.map(pid => ({
      registration_id: regData.id,
      pet_id: pid,
      pet_status: 'on_process'
    }))

    const { error: rpError } = await supabase.from('registration_pets').insert(regPets)
    if (rpError) { setError(rpError.message); setSubmitting(false); return }

    const { generateQRCode } = await import('@/lib/qrgen')
    const qr = await generateQRCode(regData.qr_token)
    setQrDataUrl(qr)
    setQrToken(regData.qr_token)
    setStep('done')
    setSubmitting(false)
  }

  const togglePet = (id: string) => {
    setSelectedPetIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

  const card: React.CSSProperties = { background: 'white', borderRadius: 12, border: '1px solid #ede8f3' }

  // ── DONE ──
  if (step === 'done') return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ ...card, padding: '48px 40px', textAlign: 'center', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0a2e', marginBottom: 8 }}>Registered!</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>
            You're registered for <b style={{ color: '#1a0a2e' }}>{selectedEvent?.event_name}</b>
          </p>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>
            {selectedEvent?.event_date ? fmt(selectedEvent.event_date) : ''} · {selectedEvent?.barangay}
          </p>

          {qrDataUrl && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Show this QR at check-in</div>
              <img src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12, margin: '0 auto', display: 'block' }} />
              {qrToken && (
                <div style={{ marginTop: 10, background: '#f5edf8', border: '1px solid #e8d5f0', borderRadius: 8, padding: '8px 14px', fontSize: 11, color: '#7b2d8b', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {qrToken}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setStep('events'); setSelectedEvent(null); setSelectedPetIds([]) }} style={{ flex: 1, padding: '11px', background: 'white', color: '#7b2d8b', border: '1.5px solid #e8d5f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Register Another
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ flex: 1, padding: '11px', background: '#7b2d8b', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>
      <main style={{ flex: 1 }}>

        {/* HEADER */}
        <header style={{ height: 60, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #ede8f3', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b2d8b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Dashboard
            </button>
            <span style={{ color: '#ddd' }}>·</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1a0a2e' }}>Register for Event</span>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(['events', 'pets', 'confirm'] as Step[]).map((s, i) => {
              const labels: Record<string, string> = { events: 'Choose Event', pets: 'Select Pets', confirm: 'Confirm' }
              const steps: Step[] = ['events', 'pets', 'confirm']
              const currentIdx = steps.indexOf(step)
              const thisIdx = steps.indexOf(s)
              const isDone = currentIdx > thisIdx
              const isActive = step === s
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDone ? '#39d353' : isActive ? '#7b2d8b' : '#e8d5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isDone || isActive ? 'white' : '#bbb' }}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? '#7b2d8b' : isDone ? '#39d353' : '#aaa' }}>{labels[s]}</span>
                  </div>
                  {i < 2 && <div style={{ width: 24, height: 1.5, background: currentIdx > i ? '#39d353' : '#e8d5f0' }} />}
                </div>
              )
            })}
          </div>
        </header>

        <div style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>

          {/* ── STEP: EVENTS ── */}
          {step === 'events' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>Available Events</h2>
                <p style={{ fontSize: 13, color: '#888' }}>Select an event to register your pet/s.</p>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading events...</div>
              ) : events.length === 0 ? (
                <div style={{ ...card, padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                  <div style={{ fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>No upcoming events</div>
                  <div style={{ fontSize: 13, color: '#aaa' }}>Check back later for new outreach schedules.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map(ev => {
                    const isSelected = selectedEvent?.id === ev.id
                    return (
                      <button key={ev.id} onClick={() => setSelectedEvent(ev)} style={{
                        ...card,
                        padding: 20, textAlign: 'left', cursor: 'pointer', width: '100%',
                        border: isSelected ? '2px solid #7b2d8b' : '1px solid #ede8f3',
                        background: isSelected ? '#faf5ff' : 'white',
                        transition: 'all 0.15s', outline: 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a0a2e' }}>{ev.event_name}</div>
                              {isSelected && (
                                <div style={{ background: '#7b2d8b', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>SELECTED</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {fmtShort(ev.event_date)}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                {ev.barangay}
                              </span>
                              <span>{ev.venue_address}</span>
                            </div>
                          </div>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: isSelected ? 'none' : '2px solid #e8d5f0', background: isSelected ? '#7b2d8b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <button
                onClick={() => setStep('pets')}
                disabled={!selectedEvent}
                style={{ marginTop: 24, width: '100%', padding: '14px', background: !selectedEvent ? '#d8b4e2' : '#7b2d8b', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: !selectedEvent ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
              >
                Continue — Select Pets →
              </button>
            </div>
          )}

          {/* ── STEP: PETS ── */}
          {step === 'pets' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>Select Your Pets</h2>
                <p style={{ fontSize: 13, color: '#888' }}>Choose which pets to register for <b style={{ color: '#7b2d8b' }}>{selectedEvent?.event_name}</b>.</p>
              </div>

              {pets.length === 0 ? (
                <div style={{ ...card, padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
                  <div style={{ fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>No pets found</div>
                  <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>You don't have any pets registered yet.</div>
                  <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 20px', background: '#7b2d8b', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pets.map(p => {
                    const isSelected = selectedPetIds.includes(p.id)
                    return (
                      <button key={p.id} onClick={() => togglePet(p.id)} style={{
                        ...card,
                        padding: '16px 20px', textAlign: 'left', cursor: 'pointer', width: '100%',
                        border: isSelected ? '2px solid #7b2d8b' : '1px solid #ede8f3',
                        background: isSelected ? '#faf5ff' : 'white',
                        transition: 'all 0.15s', outline: 'none',
                        display: 'flex', alignItems: 'center', gap: 14
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: p.species === 'cat' ? '#f5edf8' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {p.species === 'cat' ? '🐱' : '🐶'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e' }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                            {p.species} · {p.sex}{p.breed ? ` · ${p.breed}` : ''}{p.age_months ? ` · ${p.age_months} months` : ''}
                          </div>
                        </div>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', border: isSelected ? 'none' : '2px solid #e8d5f0', background: isSelected ? '#7b2d8b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedPetIds.length > 0 && (
                <div style={{ marginTop: 14, padding: '10px 16px', background: '#f5edf8', borderRadius: 8, fontSize: 13, color: '#7b2d8b', fontWeight: 600 }}>
                  {selectedPetIds.length} pet{selectedPetIds.length > 1 ? 's' : ''} selected
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep('events')} style={{ padding: '13px', background: 'white', color: '#7b2d8b', border: '1.5px solid #e8d5f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={selectedPetIds.length === 0}
                  style={{ padding: '13px', background: selectedPetIds.length === 0 ? '#d8b4e2' : '#7b2d8b', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: selectedPetIds.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                >
                  Review & Confirm →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: CONFIRM ── */}
          {step === 'confirm' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>Confirm Registration</h2>
                <p style={{ fontSize: 13, color: '#888' }}>Review your registration before submitting.</p>
              </div>

              {/* Event summary */}
              <div style={{ ...card, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Event</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a0a2e', marginBottom: 6 }}>{selectedEvent?.event_name}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
                  <span>{selectedEvent?.event_date ? fmt(selectedEvent.event_date) : ''}</span>
                  <span>·</span>
                  <span>{selectedEvent?.barangay}</span>
                  <span>·</span>
                  <span>{selectedEvent?.venue_address}</span>
                </div>
                <button onClick={() => setStep('events')} style={{ marginTop: 10, background: 'none', border: 'none', color: '#7b2d8b', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Change event</button>
              </div>

              {/* Pets summary */}
              <div style={{ ...card, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Pets ({selectedPetIds.length})</div>
                  <button onClick={() => setStep('pets')} style={{ background: 'none', border: 'none', color: '#7b2d8b', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Change</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pets.filter(p => selectedPetIds.includes(p.id)).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0eaf5' }}>
                      <div style={{ fontSize: 18 }}>{p.species === 'cat' ? '🐱' : '🐶'}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{p.species} · {p.sex}{p.breed ? ` · ${p.breed}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: '#fff0f0', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => setStep('pets')} style={{ padding: '13px', background: 'white', color: '#7b2d8b', border: '1.5px solid #e8d5f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ padding: '13px', background: submitting ? '#b57cc7' : '#7b2d8b', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                >
                  {submitting ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 14 }}>
                By registering, you confirm that the information provided is accurate.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}