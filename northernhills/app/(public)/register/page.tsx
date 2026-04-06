'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function RegisterPage() {
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [error, setError] = useState('')

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
  type Event = {
  id: string
  event_name: string
  event_date: string
  barangay: string
  venue_address: string
  max_slots: number
}

const [events, setEvents] = useState<Event[]>([])
const [selectedEventId, setSelectedEventId] = useState('')

  useEffect(() => {
  supabase
    .from('events')
    .select('id, event_name, event_date, barangay, venue_address, max_slots')
    .eq('event_status', 'published')
    .order('event_date', { ascending: true })
    .then(({ data }) => setEvents(data || []))
}, [])
  

  function addPet() {
    setPets([...pets, { name: '', species: '', breed: '', age_months: '', weight_kg: '', sex: '', health_conditions: '' }])
  }

  function removePet(index: number) {
    setPets(pets.filter((_, i) => i !== index))
  }

  function updatePet(index: number, field: string, value: string) {
    const updated = [...pets]
    updated[index] = { ...updated[index], [field]: value }
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
    setError('Error saving your information: ' + ownerError.message)
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
    setError('Error saving pet information: ' + petError.message)
    setLoading(false)
    return
  }

  // 3. Use selected event
  const eventData = { id: selectedEventId }

  // 4. Create registration
  const { data: regData, error: regError } = await supabase
    .from('registrations')
    .insert([{
      owner_id: ownerData.id,
      event_id: eventData.id,
      registration_type: 'pre_registered'
    }])
    .select()
    .single()

  if (regError) {
    setError('Error creating registration: ' + regError.message)
    setLoading(false)
    return
  }

  // 5. Link pets to registration
  const regPetsToInsert = petData.map(pet => ({
    registration_id: regData.id,
    pet_id: pet.id,
    pet_status: 'on_process'
  }))

  const { error: regPetError } = await supabase
    .from('registration_pets')
    .insert(regPetsToInsert)

  if (regPetError) {
    setError('Error linking pets to registration: ' + regPetError.message)
    setLoading(false)
    return
  }

  setDone(true)

const { generateQRCode } = await import('@/lib/qrgen')
const qr = await generateQRCode(regData.qr_token)
setQrDataUrl(qr)
setQrToken(regData.qr_token)
setDone(true)

  setLoading(false)
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

  const selectStyle = {
    ...inputStyle, cursor: 'pointer', background: 'white'
  }

  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#fafafa', fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '56px 48px',
        textAlign: 'center', maxWidth: 480, width: '100%',
        border: '1px solid #ede8f3', boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(57,211,83,0.12)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32
        }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 12 }}>
          Registration Complete!
        </h2>
        <p style={{ color: '#777', fontSize: 15, lineHeight: 1.75, marginBottom: 8 }}>
          Thank you for registering. You will receive a pre-op message with event details and preparation instructions shortly.
        </p>
        <p style={{ color: '#999', fontSize: 13, marginBottom: 32 }}>
          Please check your email or SMS for your QR code.
        </p>
        {qrDataUrl && (
  <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
      Save this QR code — you'll need it for check-in on event day.
    </p>
    <img src={qrDataUrl} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 12 }} />
    {qrToken && (
      <div style={{
        marginTop: 12, background: '#f5edf8', border: '1px solid #e8d5f0',
        borderRadius: 8, padding: '8px 16px', fontSize: 12,
        color: '#7b2d8b', fontWeight: 700, letterSpacing: '0.06em',
        fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center',
        maxWidth: 280
      }}>
        {qrToken}
      </div>
    )}
    <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
      Show this code to staff if QR scan fails
    </p>
  </div>
)}
        <Link href="/" style={{
          display: 'inline-block', background: '#7b2d8b', color: 'white',
          padding: '13px 32px', borderRadius: 10, textDecoration: 'none',
          fontWeight: 700, fontSize: 15
        }}>Back to Home</Link>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── NAVBAR — full width, outside the grid ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1a0a2e', padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        flexShrink: 0
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/FUR.png" alt="Northern Hills" width={44} height={44} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>Northern Hills</div>
            <div style={{ color: '#39d353', fontSize: 10, letterSpacing: '0.12em', fontWeight: 600 }}>VETERINARY CLINIC</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14 }}>
          {[['Home', '/'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
            <Link key={label} href={href}
              style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500 }}>
              {label}
            </Link>
          ))}
          <Link href="/login" style={{
            background: '#7b2d8b', color: 'white',
            padding: '9px 22px', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600, fontSize: 14
          }}>Sign In</Link>
        </div>
      </nav>

      {/* ── SPLIT LAYOUT — below navbar ── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1.4fr'
      }}>

        {/* LEFT — dark info panel */}
        <div style={{
          background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1050 100%)',
          padding: '56px 48px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(57,211,83,0.12)', border: '1px solid rgba(57,211,83,0.3)',
              borderRadius: 99, padding: '6px 16px', marginBottom: 28
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39d353' }} />
              <span style={{ color: '#39d353', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
                LOW COST OUTREACH PROGRAM
              </span>
            </div>

            <h1 style={{
              fontSize: 38, fontWeight: 800, color: 'white',
              lineHeight: 1.2, marginBottom: 16
            }}>
              Guest Registration<br />
              <span style={{ color: '#39d353' }}>for outreach program.</span>
            </h1>

            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8, marginBottom: 40, maxWidth: 340
            }}>
              Join our community outreach program. Low cost spay and neuter services for cats and dogs across Manila.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Low cost spay & neuter for cats and dogs',
                'QR code check-in — no paperwork',
                'AI post-op chatbot for 10 days',
                'Pre-op instructions sent to your phone',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(57,211,83,0.2)', border: '1px solid rgba(57,211,83,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1, fontSize: 11, color: '#39d353', fontWeight: 800
                  }}>✓</div>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 48 }}>
            © 2025 Northern Hills Veterinary Clinic
          </p>
        </div>

        {/* RIGHT — form panel */}
        <div style={{
          background: '#fafafa', padding: '48px',
          overflowY: 'auto', display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            {['Your Info', 'Your Pets', 'Confirm'].map((label, i) => {
              const num = i + 1
              const active = step === num
              const isDone = step > num
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: isDone ? '#39d353' : active ? '#7b2d8b' : '#e8d5f0',
                      color: isDone || active ? 'white' : '#bbb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0
                    }}>{isDone ? '✓' : num}</div>
                    <span style={{
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? '#7b2d8b' : isDone ? '#39d353' : '#aaa'
                    }}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div style={{
                      width: 40, height: 2, margin: '0 8px',
                      background: step > num ? '#39d353' : '#e8d5f0'
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* STEP 1 — Owner info */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>Your Information</h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>Tell us about yourself so we can reach you before and after the event.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    placeholder="Juan dela Cruz"
                    value={owner.full_name}
                    onChange={e => setOwner({ ...owner, full_name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Contact Number</label>
                    <input
                      placeholder="09XX XXX XXXX"
                      value={owner.contact_number}
                      onChange={e => setOwner({ ...owner, contact_number: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      placeholder="juan@email.com (optional)"
                      type="email"
                      value={owner.email}
                      onChange={e => setOwner({ ...owner, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Home Address</label>
                  <input
                    placeholder="Street, Barangay, City"
                    value={owner.address}
                    onChange={e => setOwner({ ...owner, address: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
  <label style={labelStyle}>Select Event</label>
  <select
    value={selectedEventId}
    onChange={e => setSelectedEventId(e.target.value)}
    style={selectStyle}>
    <option value="">-- Choose an event --</option>
    {events.map(ev => (
      <option key={ev.id} value={ev.id}>
        {ev.event_name} — {new Date(ev.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {ev.barangay}
      </option>
    ))}
  </select>
</div>

              <div>
  <label style={labelStyle}>
    Questions or Concerns <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span>
  </label>
  <textarea
    placeholder="Any questions about the procedure or special concerns about your pet? We'll include answers in your pre-op email."
    value={owner.notes}
    onChange={e => setOwner({ ...owner, notes: e.target.value })}
    style={{
      ...inputStyle,
      minHeight: 90,
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: 1.6
    }}
  />
  <div style={{ 
    fontSize: 11, 
    color: '#999', 
    marginTop: 6,
    fontStyle: 'italic' 
  }}>
    Example: "My dog is scared of other animals" or "Is fasting required?"
  </div>
</div>

              <button
  onClick={() => setStep(2)}
  disabled={!owner.full_name || !owner.contact_number || !selectedEventId}
  style={{
    marginTop: 32, width: '100%', padding: '14px',
    background: !owner.full_name || !owner.contact_number || !selectedEventId ? '#d8b4e2' : '#7b2d8b',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 700,
    cursor: !owner.full_name || !owner.contact_number || !selectedEventId ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit'
  }}>
  Continue to Pet Details →
</button>
            </div>
          )}

          {/* STEP 2 — Pet info */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>Your Pet/s</h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>Add all pets you are bringing to the event. You can add multiple pets.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {pets.map((pet, index) => (
                  <div key={index} style={{
                    background: 'white', borderRadius: 14, padding: 24,
                    border: '1.5px solid #e8d5f0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: '#f5edf8', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: '#7b2d8b'
                        }}>{index + 1}</div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#1a0a2e' }}>
                          {pet.name ? pet.name : `Pet ${index + 1}`}
                        </span>
                      </div>
                      {pets.length > 1 && (
                        <button
                          onClick={() => removePet(index)}
                          style={{
                            background: '#fff0f0', color: '#ef4444',
                            border: '1px solid #fecaca', borderRadius: 6,
                            padding: '4px 12px', fontSize: 12,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                          }}>Remove</button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Age (in months)</label>
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
                        <label style={labelStyle}>Known Health Conditions <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label>
                        <input placeholder="e.g. None, or list any conditions" value={pet.health_conditions}
                          onChange={e => updatePet(index, 'health_conditions', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addPet} style={{
                marginTop: 16, width: '100%', padding: '12px',
                background: 'white', color: '#7b2d8b',
                border: '1.5px dashed #c084d4', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>+ Add Another Pet</button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(1)} style={{
                  padding: '13px', background: 'white', color: '#7b2d8b',
                  border: '1.5px solid #e8d5f0', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={pets.some(p => !p.name || !p.species || !p.sex)}
                  style={{
                    padding: '13px',
                    background: pets.some(p => !p.name || !p.species || !p.sex) ? '#d8b4e2' : '#7b2d8b',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700,
                    cursor: pets.some(p => !p.name || !p.species || !p.sex) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit'
                  }}>Review Registration →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>Confirm Registration</h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>Review your details before submitting.</p>

              <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                border: '1.5px solid #e8d5f0', marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>Owner Details</h3>
                  <button onClick={() => setStep(1)} style={{
                    background: 'none', border: 'none', color: '#7b2d8b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { l: 'Full Name', v: owner.full_name },
                    { l: 'Contact', v: owner.contact_number },
                    { l: 'Email', v: owner.email || '—' },
                    { l: 'Address', v: owner.address || '—' },
                    { l: 'Event', v: events.find(e => e.id === selectedEventId)?.event_name || '—' },
                  ].map(row => (
                    <div key={row.l}>
                      <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>{row.l}</div>
                      <div style={{ fontSize: 14, color: '#1a0a2e', fontWeight: 500 }}>{row.v}</div>
                    </div>
                  ))}
                </div>
                {owner.notes && (
  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0eaf5' }}>
    <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>
      QUESTIONS/CONCERNS
    </div>
    <div style={{ 
      fontSize: 13, 
      color: '#555', 
      lineHeight: 1.6,
      background: '#fafafa',
      padding: 12,
      borderRadius: 6,
      fontStyle: 'italic'
    }}>
      "{owner.notes}"
    </div>
  </div>
)}
              </div>

              <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                border: '1.5px solid #e8d5f0', marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>Pets ({pets.length})</h3>
                  <button onClick={() => setStep(2)} style={{
                    background: 'none', border: 'none', color: '#7b2d8b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pets.map((pet, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 14, alignItems: 'center',
                      padding: '12px 16px', background: '#fafafa',
                      borderRadius: 10, border: '1px solid #f0eaf5'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#f5edf8', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 16
                      }}>{pet.species === 'cat' ? '🐱' : '🐶'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e' }}>{pet.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {pet.species} · {pet.breed} · {pet.sex} · {pet.age_months} months · {pet.weight_kg} kg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#fff0f0', border: '1px solid #fecaca',
                  color: '#ef4444', borderRadius: 8, padding: '12px 16px',
                  fontSize: 13, marginBottom: 16
                }}>{error}</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => setStep(2)} style={{
                  padding: '13px', background: 'white', color: '#7b2d8b',
                  border: '1.5px solid #e8d5f0', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: '13px',
                    background: loading ? '#b57cc7' : '#7b2d8b',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit'
                  }}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 16 }}>
                By registering, you agree that the information provided is accurate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}