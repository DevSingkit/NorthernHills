'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'


export default function AccountRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [owner, setOwner] = useState({
    full_name: '', contact_number: '', email: '', address: ''
  })

  const [account, setAccount] = useState({
    password: '', confirm_password: ''
  })

  const [pets, setPets] = useState([
    { name: '', species: '', breed: '', age_months: '', weight_kg: '', sex: '', health_conditions: '' }
  ])

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
  if (loading) return

  setError('')

  // Basic validation
  if (!owner.full_name || !owner.email || !owner.contact_number) {
    setError('Please complete your information.')
    return
  }

  if (account.password !== account.confirm_password) {
    setError('Passwords do not match.')
    return
  }

  if (account.password.length < 8) {
    setError('Password must be at least 8 characters.')
    return
  }

  if (pets.some(p => !p.name || !p.species || !p.sex)) {
    setError('All pets must have name, species, and sex.')
    return
  }

  setLoading(true)

  // Step 1 — create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: owner.email,
    password: account.password,
  })

  if (authError) {
    setError('Could not create account: ' + authError.message)
    setLoading(false)
    return
  }

  const userId = authData.user?.id

  if (!userId) {
    setError('User ID not found after signup.')
    setLoading(false)
    return
  }

  // Step 2 — insert owner
const { data: ownerInsert, error: ownerError } = await supabase
  .from('owners')
  .insert([{
    full_name: owner.full_name,
    contact_number: owner.contact_number,
    email: owner.email,
    address: owner.address,
  }])
  .select()

if (ownerError || !ownerInsert || ownerInsert.length === 0) {
  setError('Error saving your information: ' + (ownerError?.message || 'No data returned'))
  setLoading(false)
  return
}

const ownerId = ownerInsert[0].id

  // Step 3 — insert account (FIXED)
const { error: accountError } = await supabase
  .from('accounts')
  .insert([{
    owner_id: ownerId,
    auth_user_id: userId,
  }])

  if (accountError) {
    setError('Error linking your account: ' + accountError.message)
    setLoading(false)
    return
  }

  // Step 4 — insert pets
  const petsToInsert = pets.map(p => ({
    owner_id: ownerId,
    name: p.name,
    species: p.species,
    breed: p.breed || null,
    age_months: p.age_months ? parseInt(p.age_months) : null,
    weight_kg: p.weight_kg ? parseFloat(p.weight_kg) : null,
    sex: p.sex,
    health_conditions: p.health_conditions || null,
  }))

  const { error: petError } = await supabase
    .from('pets')
    .insert(petsToInsert)

  if (petError) {
    setError('Error saving pet information: ' + petError.message)
    setLoading(false)
    return
  }

  setDone(true)
  setLoading(false)
}
  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s'
  }

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600, color: '#444', marginBottom: 6
  }

  const selectStyle = { ...inputStyle, cursor: 'pointer' }

  // ── SUCCESS SCREEN ──
  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#fafafa', fontFamily: "'Segoe UI', sans-serif",
      padding: 24
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '56px 48px',
        textAlign: 'center', maxWidth: 480, width: '100%',
        border: '1px solid #ede8f3',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(57,211,83,0.12)',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 12 }}>
          Account Created!
        </h2>
        <p style={{ color: '#777', fontSize: 15, lineHeight: 1.75, marginBottom: 8 }}>
          Your account and pet profiles have been saved. Check your email to verify your account before signing in.
        </p>
        <p style={{ color: '#aaa', fontSize: 13, marginBottom: 32 }}>
          Once verified, you can sign in and register for outreach events without re-entering your details.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/login" style={{
            display: 'block', background: '#7b2d8b', color: 'white',
            padding: '13px 32px', borderRadius: 10, textDecoration: 'none',
            fontWeight: 700, fontSize: 15, textAlign: 'center',
            transition: 'background 0.15s', cursor: 'pointer'
          }}>Sign In to Your Account</Link>
          <Link href="/" style={{
            display: 'block', background: 'white', color: '#7b2d8b',
            padding: '12px 32px', borderRadius: 10, textDecoration: 'none',
            fontWeight: 600, fontSize: 14, textAlign: 'center',
            border: '1.5px solid #e8d5f0', transition: 'all 0.15s', cursor: 'pointer'
          }}>Back to Home</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif"
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1a0a2e', padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)', flexShrink: 0
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
            <Link key={label} href={href} style={{
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              fontWeight: 500, transition: 'color 0.15s'
            }}>{label}</Link>
          ))}
          <Link href="/login" style={{
            background: 'transparent', color: 'rgba(255,255,255,0.75)',
            padding: '9px 22px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            textDecoration: 'none', fontWeight: 500, fontSize: 14
          }}>Sign In</Link>
        </div>
      </nav>

      {/* ── SPLIT LAYOUT ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.4fr' }}>

        {/* LEFT — dark panel */}
        <div style={{
          background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1050 100%)',
          padding: '56px 48px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(57,211,83,0.12)',
              border: '1px solid rgba(57,211,83,0.3)',
              borderRadius: 99, padding: '6px 16px', marginBottom: 28
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39d353' }} />
              <span style={{ color: '#39d353', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
                CREATE AN ACCOUNT
              </span>
            </div>

            <h1 style={{
              fontSize: 36, fontWeight: 800, color: 'white',
              lineHeight: 1.2, marginBottom: 16
            }}>
              Register once.<br />
              <span style={{ color: '#39d353' }}>Return with ease.</span>
            </h1>

            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.8, marginBottom: 40, maxWidth: 320
            }}>
              Creating an account saves your details and pet profiles permanently.
              At the next outreach event, just select which pets are attending
              — no re-entering anything.
            </p>

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '→', text: 'Skip re-entering details at future events' },
                { icon: '→', text: 'All pet profiles saved to your account' },
                { icon: '→', text: 'Access all past registration history' },
                { icon: '→', text: 'View active and expired chatbot session links' },
                { icon: '→', text: 'Register for upcoming events in one click' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(57,211,83,0.2)',
                    border: '1px solid rgba(57,211,83,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Switch to guest */}
            <div style={{
              marginTop: 40, padding: '16px 20px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10
            }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Don&apos;t want an account?{' '}
                <Link href="/register" style={{
                  color: '#39d353', fontWeight: 600,
                  textDecoration: 'none', transition: 'opacity 0.15s'
                }}>
                  Register as a guest instead
                </Link>
                {' '}— no account required.
              </p>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 48 }}>
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
            {['Your Info', 'Your Account', 'Your Pets', 'Confirm'].map((label, i) => {
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
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                      transition: 'background 0.2s'
                    }}>
                      {isDone
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : num
                      }
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? '#7b2d8b' : isDone ? '#39d353' : '#bbb',
                      display: i < 3 ? 'block' : 'block'
                    }}>{label}</span>
                  </div>
                  {i < 3 && (
                    <div style={{
                      width: 28, height: 2, margin: '0 6px',
                      background: step > num ? '#39d353' : '#e8d5f0',
                      transition: 'background 0.2s', flexShrink: 0
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── STEP 1: Owner info ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
                Your Information
              </h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
                This will be saved to your account and used for all future registrations.
              </p>

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
                      type="email"
                      placeholder="juan@email.com"
                      value={owner.email}
                      onChange={e => setOwner({ ...owner, email: e.target.value })}
                      style={inputStyle}
                    />
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                      Used to sign in to your account
                    </p>
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

              <button
                onClick={() => setStep(2)}
                disabled={!owner.full_name || !owner.contact_number || !owner.email}
                style={{
                  marginTop: 32, width: '100%', padding: '14px',
                  background: !owner.full_name || !owner.contact_number || !owner.email
                    ? '#d8b4e2' : '#7b2d8b',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: !owner.full_name || !owner.contact_number || !owner.email
                    ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s'
                }}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: Password ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
                Create Your Password
              </h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
                You&apos;ll use your email and this password to sign in at future events.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={account.password}
                    onChange={e => setAccount({ ...account, password: e.target.value })}
                    style={inputStyle}
                  />
                  {/* Password strength indicator */}
                  {account.password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(level => {
                          const strength = account.password.length >= 12 ? 4
                            : account.password.length >= 10 ? 3
                            : account.password.length >= 8 ? 2
                            : 1
                          return (
                            <div key={level} style={{
                              flex: 1, height: 3, borderRadius: 99,
                              background: level <= strength
                                ? strength >= 4 ? '#39d353'
                                  : strength >= 3 ? '#f59e0b'
                                  : strength >= 2 ? '#7b2d8b'
                                  : '#ef4444'
                                : '#e8d5f0',
                              transition: 'background 0.2s'
                            }} />
                          )
                        })}
                      </div>
                      <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                        {account.password.length < 8 ? 'Too short — minimum 8 characters'
                          : account.password.length < 10 ? 'Acceptable'
                          : account.password.length < 12 ? 'Good'
                          : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={account.confirm_password}
                    onChange={e => setAccount({ ...account, confirm_password: e.target.value })}
                    style={{
                      ...inputStyle,
                      borderColor: account.confirm_password.length > 0
                        ? account.password === account.confirm_password ? '#39d353' : '#ef4444'
                        : '#e8d5f0'
                    }}
                  />
                  {account.confirm_password.length > 0 && (
                    <p style={{
                      fontSize: 11, marginTop: 4,
                      color: account.password === account.confirm_password ? '#39d353' : '#ef4444'
                    }}>
                      {account.password === account.confirm_password ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 32 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '13px', background: 'white', color: '#7b2d8b',
                    border: '1.5px solid #e8d5f0', borderRadius: 10,
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s'
                  }}>← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={
                    !account.password ||
                    account.password.length < 8 ||
                    account.password !== account.confirm_password
                  }
                  style={{
                    padding: '13px',
                    background: !account.password || account.password.length < 8 || account.password !== account.confirm_password
                      ? '#d8b4e2' : '#7b2d8b',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700,
                    cursor: !account.password || account.password.length < 8 || account.password !== account.confirm_password
                      ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s'
                  }}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Pets ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
                Your Pets
              </h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
                These profiles are saved permanently. At future events, you just
                select which pets are attending — no re-entering details.
              </p>

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
                          {pet.name || `Pet ${index + 1}`}
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
                        <label style={labelStyle}>
                          Health Conditions
                          <span style={{ color: '#bbb', fontWeight: 400 }}> (optional)</span>
                        </label>
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
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.15s'
              }}>+ Add Another Pet</button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(2)} style={{
                  padding: '13px', background: 'white', color: '#7b2d8b',
                  border: '1.5px solid #e8d5f0', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>← Back</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={pets.some(p => !p.name || !p.species || !p.sex)}
                  style={{
                    padding: '13px',
                    background: pets.some(p => !p.name || !p.species || !p.sex) ? '#d8b4e2' : '#7b2d8b',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700,
                    cursor: pets.some(p => !p.name || !p.species || !p.sex) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s'
                  }}>Review & Confirm →</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirm ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
                Review & Confirm
              </h2>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
                Check everything before creating your account.
              </p>

              {/* Owner summary */}
              <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                border: '1.5px solid #e8d5f0', marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e' }}>Your Details</h3>
                  <button onClick={() => setStep(1)} style={{
                    background: 'none', border: 'none', color: '#7b2d8b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { l: 'Full Name', v: owner.full_name },
                    { l: 'Contact', v: owner.contact_number },
                    { l: 'Email', v: owner.email },
                    { l: 'Address', v: owner.address || '—' },
                  ].map(row => (
                    <div key={row.l}>
                      <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>{row.l}</div>
                      <div style={{ fontSize: 14, color: '#1a0a2e', fontWeight: 500 }}>{row.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password summary */}
              <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                border: '1.5px solid #e8d5f0', marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e' }}>Account Password</h3>
                  <button onClick={() => setStep(2)} style={{
                    background: 'none', border: 'none', color: '#7b2d8b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#39d353'
                  }} />
                  <span style={{ fontSize: 14, color: '#555' }}>Password set ({account.password.length} characters)</span>
                </div>
              </div>

              {/* Pets summary */}
              <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                border: '1.5px solid #e8d5f0', marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e' }}>Pets ({pets.length})</h3>
                  <button onClick={() => setStep(3)} style={{
                    background: 'none', border: 'none', color: '#7b2d8b',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                  }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                      }}>
                        <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#f5edf8', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 16
                      }}>{pet.species === 'cat' ? '🐱' : '🐶'}</div>
                        
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a2e' }}>{pet.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {pet.species} · {pet.breed || 'no breed'} · {pet.sex} · {pet.age_months} months · {pet.weight_kg} kg
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
                  fontSize: 13, marginBottom: 16, lineHeight: 1.5
                }}>{error}</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => setStep(3)} style={{
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
                    fontFamily: 'inherit', transition: 'background 0.15s'
                  }}>{loading ? 'Creating Account...' : 'Create Account'}</button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 16 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#7b2d8b', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}