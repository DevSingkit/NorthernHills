'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  event_name: string
  event_date: string
  barangay: string
}

const sideNav = [
  { label: 'Dashboard',    href: '/staff', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: 'Walk-In',      href: '/staff/walkin',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
  { label: 'QR Check-In',  href: '/staff/checkin',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg> },
  { label: 'Messages',     href: '/staff/messages',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { label: 'Chat History', href: '/staff/chats',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
]

export default function WalkInPage() {
  const [activeNav, setActiveNav] = useState('Walk-In')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const [owner, setOwner] = useState({
    full_name: '',
    contact_number: '',
    email: '',
    address: '',
    notes: ''
  })

  const [pets, setPets] = useState([
    { name: '', species: '', breed: '', age_months: '', weight_kg: '', sex: '', health_conditions: '' }
  ])

  useEffect(() => {
    supabase
      .from('events')
      .select('id, event_name, event_date, barangay')
      .in('event_status', ['published', 'ongoing'])
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || [])
        if (data && data.length > 0) setSelectedEventId(data[0].id)
      })
  }, [])

  function addPet() {
    setPets([...pets, { name: '', species: '', breed: '', age_months: '', weight_kg: '', sex: '', health_conditions: '' }])
  }

  function removePet(i: number) {
    setPets(pets.filter((_, idx) => idx !== i))
  }

  function updatePet(i: number, field: string, value: string) {
    const updated = [...pets]
    updated[i] = { ...updated[i], [field]: value }
    setPets(updated)
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)

    // 1. Insert owner
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners')
      .insert([owner])
      .select()
      .single()

    if (ownerError) {
      setError('Error saving owner: ' + ownerError.message)
      setLoading(false)
      return
    }

    // 2. Insert pets
    const petsToInsert = pets.map(p => ({
      ...p,
      owner_id: ownerData.id,
      age_months: parseInt(p.age_months) || 0,
      weight_kg: parseFloat(p.weight_kg) || 0,
    }))

    const { data: petData, error: petError } = await supabase
      .from('pets')
      .insert(petsToInsert)
      .select()

    if (petError) {
      setError('Error saving pets: ' + petError.message)
      setLoading(false)
      return
    }

    // 3. Create registration as walk_in + immediately check in
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert([{
        owner_id: ownerData.id,
        event_id: selectedEventId,
        registration_type: 'walk_in',
        checked_in_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (regError) {
      setError('Error creating registration: ' + regError.message)
      setLoading(false)
      return
    }

    // 4. Assign queue number
    await supabase.rpc('get_next_queue_number', { p_event_id: selectedEventId })
      .then(({ data: qNum }) => {
        if (qNum) {
          supabase.from('registrations').update({ queue_number: qNum }).eq('id', regData.id)
        }
      })

    // 5. Link pets
    const regPets = petData.map(pet => ({
      registration_id: regData.id,
      pet_id: pet.id,
      pet_status: 'on_process'
    }))

    const { error: regPetError } = await supabase
      .from('registration_pets')
      .insert(regPets)

    if (regPetError) {
      setError('Error linking pets: ' + regPetError.message)
      setLoading(false)
      return
    }

    // 6. Generate QR
    const { generateQRCode } = await import('@/lib/qrgen')
    const qr = await generateQRCode(regData.qr_token)
    setQrDataUrl(qr)
    setQrToken(regData.qr_token)
    setDone(true)
    setLoading(false)
  }

  function resetForm() {
    setStep(1)
    setDone(false)
    setError('')
    setQrToken('')
    setQrDataUrl('')
    setOwner({ full_name: '', contact_number: '', email: '', address: '', notes: '' })
    setPets([{ name: '', species: '', breed: '', age_months: '', weight_kg: '', sex: '', health_conditions: '' }])
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white', boxSizing: 'border-box' as const
  }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 5 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: '#1a0a2e', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40, flexShrink: 0
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
            <Link key={item.label} href={item.href} onClick={() => setActiveNav(item.label)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: activeNav === item.label ? 'white' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              background: activeNav === item.label ? 'rgba(123,45,139,0.35)' : 'transparent',
              borderLeft: `3px solid ${activeNav === item.label ? '#7b2d8b' : 'transparent'}`,
              transition: 'all 0.15s', cursor: 'pointer'
            }}>
              <span style={{ opacity: activeNav === item.label ? 1 : 0.65 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/staff' }}
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
      <main style={{ marginLeft: 220, flex: 1, padding: '40px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>Walk-In Registration</h1>
            <p style={{ fontSize: 14, color: '#999' }}>Register a walk-in participant on-site. They will be checked in immediately.</p>
          </div>

          {/* Done state */}
          {done ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: '48px 40px',
              border: '1.5px solid #e8d5f0', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(57,211,83,0.12)', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 8 }}>Walk-In Registered!</h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>
                Participant has been registered and checked in. Queue number has been assigned.
              </p>

              {qrDataUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                  <p style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>
                    Show or print this QR code for the participant.
                  </p>
                  <img src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12 }} />
                  {qrToken && (
                    <div style={{
                      marginTop: 10, background: '#f5edf8', border: '1px solid #e8d5f0',
                      borderRadius: 8, padding: '7px 16px', fontSize: 12,
                      color: '#7b2d8b', fontWeight: 700, fontFamily: 'monospace',
                      wordBreak: 'break-all', maxWidth: 280, textAlign: 'center'
                    }}>{qrToken}</div>
                  )}
                  <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
                    Fallback code if QR scan fails
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={resetForm} style={{
                  background: '#7b2d8b', color: 'white', padding: '11px 28px',
                  borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>Register Another</button>
                <Link href="/staff/dashboard" style={{
                  background: 'white', color: '#7b2d8b', padding: '11px 28px',
                  borderRadius: 10, border: '1.5px solid #e8d5f0', fontSize: 14,
                  fontWeight: 700, textDecoration: 'none'
                }}>Back to Dashboard</Link>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 16, padding: 32,
              border: '1.5px solid #e8d5f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                {['Owner Info', 'Pets', 'Confirm'].map((label, i) => {
                  const num = i + 1
                  const active = step === num
                  const isDone = step > num
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isDone ? '#39d353' : active ? '#7b2d8b' : '#e8d5f0',
                          color: isDone || active ? 'white' : '#bbb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>{isDone ? '✓' : num}</div>
                        <span style={{
                          fontSize: 13, fontWeight: active ? 700 : 500,
                          color: active ? '#7b2d8b' : isDone ? '#39d353' : '#aaa'
                        }}>{label}</span>
                      </div>
                      {i < 2 && <div style={{ width: 36, height: 2, margin: '0 8px', background: step > num ? '#39d353' : '#e8d5f0' }} />}
                    </div>
                  )
                })}
              </div>

              {/* STEP 1 — Owner Info */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a0a2e', marginBottom: 20 }}>Owner Information</h2>

                  {/* Event selector */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Event</label>
                    <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={selectStyle}>
                      <option value="">-- Select event --</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.event_name} — {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {ev.barangay}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input placeholder="Juan dela Cruz" value={owner.full_name}
                        onChange={e => setOwner({ ...owner, full_name: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Contact Number</label>
                        <input placeholder="09XX XXX XXXX" value={owner.contact_number}
                          onChange={e => setOwner({ ...owner, contact_number: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                        <input placeholder="juan@email.com" type="email" value={owner.email}
                          onChange={e => setOwner({ ...owner, email: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Address</label>
                      <input placeholder="Street, Barangay, City" value={owner.address}
                        onChange={e => setOwner({ ...owner, address: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Notes <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                      <textarea placeholder="Any concerns or special notes..." value={owner.notes}
                        onChange={e => setOwner({ ...owner, notes: e.target.value })}
                        style={{ ...inputStyle, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }} />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!owner.full_name || !owner.contact_number || !selectedEventId}
                    style={{
                      marginTop: 24, width: '100%', padding: '12px',
                      background: !owner.full_name || !owner.contact_number || !selectedEventId ? '#d8b4e2' : '#7b2d8b',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      cursor: !owner.full_name || !owner.contact_number || !selectedEventId ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit'
                    }}>Continue to Pets →</button>
                </div>
              )}

              {/* STEP 2 — Pets */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a0a2e', marginBottom: 20 }}>Pet Information</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {pets.map((pet, index) => (
                      <div key={index} style={{
                        background: '#fafafa', borderRadius: 12, padding: 20,
                        border: '1.5px solid #e8d5f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%',
                              background: '#f5edf8', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#7b2d8b'
                            }}>{index + 1}</div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e' }}>
                              {pet.name || `Pet ${index + 1}`}
                            </span>
                          </div>
                          {pets.length > 1 && (
                            <button onClick={() => removePet(index)} style={{
                              background: '#fff0f0', color: '#ef4444', border: '1px solid #fecaca',
                              borderRadius: 6, padding: '3px 10px', fontSize: 12,
                              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                            }}>Remove</button>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={labelStyle}>Pet Name</label>
                              <input placeholder="e.g. Brownie" value={pet.name}
                                onChange={e => updatePet(index, 'name', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Species</label>
                              <select value={pet.species}
                                onChange={e => updatePet(index, 'species', e.target.value)} style={selectStyle}>
                                <option value="">Select species</option>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={labelStyle}>Breed</label>
                              <input placeholder="e.g. Aspin" value={pet.breed}
                                onChange={e => updatePet(index, 'breed', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Sex</label>
                              <select value={pet.sex}
                                onChange={e => updatePet(index, 'sex', e.target.value)} style={selectStyle}>
                                <option value="">Select sex</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={labelStyle}>Age (months)</label>
                              <input placeholder="e.g. 12" type="number" value={pet.age_months}
                                onChange={e => updatePet(index, 'age_months', e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Weight (kg)</label>
                              <input placeholder="e.g. 4.5" type="number" value={pet.weight_kg}
                                onChange={e => updatePet(index, 'weight_kg', e.target.value)} style={inputStyle} />
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Health Conditions <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                            <input placeholder="e.g. None" value={pet.health_conditions}
                              onChange={e => updatePet(index, 'health_conditions', e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={addPet} style={{
                    marginTop: 12, width: '100%', padding: '10px',
                    background: 'white', color: '#7b2d8b',
                    border: '1.5px dashed #c084d4', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>+ Add Another Pet</button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                    <button onClick={() => setStep(1)} style={{
                      padding: '12px', background: 'white', color: '#7b2d8b',
                      border: '1.5px solid #e8d5f0', borderRadius: 10,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>← Back</button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={pets.some(p => !p.name || !p.species || !p.sex)}
                      style={{
                        padding: '12px',
                        background: pets.some(p => !p.name || !p.species || !p.sex) ? '#d8b4e2' : '#7b2d8b',
                        color: 'white', border: 'none', borderRadius: 10,
                        fontSize: 14, fontWeight: 700,
                        cursor: pets.some(p => !p.name || !p.species || !p.sex) ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit'
                      }}>Review →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Confirm */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a0a2e', marginBottom: 20 }}>Confirm Registration</h2>

                  {/* Walk-in notice */}
                  <div style={{
                    background: '#fff8f0', border: '1px solid #fcd34d',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                    fontSize: 13, color: '#92400e', fontWeight: 500
                  }}>
                    This participant will be registered as <strong>Walk-In</strong> and checked in immediately upon submission.
                  </div>

                  {/* Owner summary */}
                  <div style={{
                    background: '#fafafa', borderRadius: 12, padding: 20,
                    border: '1px solid #e8d5f0', marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e' }}>Owner Details</h3>
                      <button onClick={() => setStep(1)} style={{
                        background: 'none', border: 'none', color: '#7b2d8b',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>Edit</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { l: 'Full Name', v: owner.full_name },
                        { l: 'Contact', v: owner.contact_number },
                        { l: 'Email', v: owner.email || '—' },
                        { l: 'Address', v: owner.address || '—' },
                        { l: 'Event', v: events.find(e => e.id === selectedEventId)?.event_name || '—' },
                      ].map(row => (
                        <div key={row.l}>
                          <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>{row.l}</div>
                          <div style={{ fontSize: 13, color: '#1a0a2e', fontWeight: 500 }}>{row.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pets summary */}
                  <div style={{
                    background: '#fafafa', borderRadius: 12, padding: 20,
                    border: '1px solid #e8d5f0', marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e' }}>Pets ({pets.length})</h3>
                      <button onClick={() => setStep(2)} style={{
                        background: 'none', border: 'none', color: '#7b2d8b',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>Edit</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pets.map((pet, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', background: 'white',
                          borderRadius: 8, border: '1px solid #f0eaf5'
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#f5edf8', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 14
                          }}>{pet.species === 'cat' ? '🐱' : '🐶'}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0a2e' }}>{pet.name}</div>
                            <div style={{ fontSize: 11, color: '#999' }}>
                              {pet.species} · {pet.breed} · {pet.sex} · {pet.age_months}mo · {pet.weight_kg}kg
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div style={{
                      background: '#fff0f0', border: '1px solid #fecaca',
                      color: '#ef4444', borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, marginBottom: 16
                    }}>{error}</div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button onClick={() => setStep(2)} style={{
                      padding: '12px', background: 'white', color: '#7b2d8b',
                      border: '1.5px solid #e8d5f0', borderRadius: 10,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>← Back</button>
                    <button onClick={handleSubmit} disabled={loading} style={{
                      padding: '12px',
                      background: loading ? '#b57cc7' : '#7b2d8b',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit'
                    }}>{loading ? 'Registering...' : 'Register & Check In'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}