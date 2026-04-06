'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type Owner = {
  id: string
  full_name: string
  contact_number: string
  email: string
  address: string
}

type Pet = {
  id: string
  name: string
  species: string
  breed: string
  sex: string
  age_months: number
  weight_kg: number
  health_conditions: string
}

type RegistrationPet = {
  id: string
  pet_id: string
  pet_status: 'on_process' | 'complete' | 'rejected'
  pets: Pet
  examination_records: ExamRecord[]
  medical_records: MedicalRecord[]
}

type ExamRecord = {
  id: string
  actual_weight: number
  findings: string
  acceptance_status: 'accepted' | 'rejected'
  rejection_reason: string | null
}

type MedicalRecord = {
  id: string
  procedure_performed: string
  medication_dispensed: string
  discharge_at: string | null
}

type BillingRecord = {
  id: string
  procedure_fee: number
  medication_cost: number
  total_amount: number
  payment_status: 'unpaid' | 'paid'
  payment_method: 'cash' | 'gcash' | 'other' | null
}

type Registration = {
  id: string
  queue_number: number | null
  registration_type: 'pre_registered' | 'walk_in'
  checked_in_at: string | null
  created_at: string
  owners: Owner
  events: { event_name: string; event_date: string; barangay: string }
  registration_pets: RegistrationPet[]
  billing_records: BillingRecord[]
}

const navItems = [
  { label: 'Dashboard',    href: '/staff/dashboard' },
  { label: 'Check-in',     href: '/staff/checkin' },
  { label: 'Walk-in',      href: '/staff/walkin' },
  { label: 'Messages',     href: '/staff/messages' },
]

const petStatusColors = {
  on_process: { bg: '#e3f2fd', text: '#1565c0', border: '#64b5f6', label: 'On Process' },
  complete:   { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784', label: 'Complete' },
  rejected:   { bg: '#ffebee', text: '#c62828', border: '#ef5350', label: 'Rejected' },
}

export default function ParticipantPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'examination' | 'procedure' | 'billing' | 'discharge'>('overview')

  // Examination form state
  const [examForms, setExamForms] = useState<Record<string, {
    actual_weight: string
    findings: string
    acceptance_status: 'accepted' | 'rejected'
    rejection_reason: string
  }>>({})
  const [examSaving, setExamSaving] = useState<Record<string, boolean>>({})

  // Medical record form state
  const [medForms, setMedForms] = useState<Record<string, {
    procedure_performed: string
    medication_dispensed: string
  }>>({})
  const [medSaving, setMedSaving] = useState<Record<string, boolean>>({})

  // Billing state
  const [billing, setBilling] = useState<{
    procedure_fee: string
    medication_cost: string
    payment_status: 'unpaid' | 'paid'
    payment_method: 'cash' | 'gcash' | 'other'
  }>({ procedure_fee: '', medication_cost: '', payment_status: 'unpaid', payment_method: 'cash' })
  const [billingSaving, setBillingSaving] = useState(false)

  useEffect(() => { fetchRegistration() }, [id])

  async function fetchRegistration() {
    setLoading(true)
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        id, queue_number, registration_type, checked_in_at, created_at,
        owners (id, full_name, contact_number, email, address),
        events (event_name, event_date, barangay),
        registration_pets (
          id, pet_id, pet_status,
          pets (id, name, species, breed, sex, age_months, weight_kg, health_conditions),
          examination_records (id, actual_weight, findings, acceptance_status, rejection_reason),
          medical_records (id, procedure_performed, medication_dispensed, discharge_at)
        ),
        billing_records (id, procedure_fee, medication_cost, total_amount, payment_status, payment_method)
      `)
      .eq('id', id)
      .single()

    if (error) { console.error(error); setLoading(false); return }
    setRegistration(data as any)

    // Pre-fill billing if exists
    if (data.billing_records?.[0]) {
      const b = data.billing_records[0]
      setBilling({
        procedure_fee: String(b.procedure_fee),
        medication_cost: String(b.medication_cost),
        payment_status: b.payment_status,
        payment_method: b.payment_method || 'cash'
      })
    }
    setLoading(false)
  }

  async function saveExam(regPetId: string, petId: string) {
    const form = examForms[regPetId]
    if (!form) return
    setExamSaving(prev => ({ ...prev, [regPetId]: true }))

    await supabase.from('examination_records').upsert({
      registration_pet_id: regPetId,
      pet_id: petId,
      registration_id: id,
      actual_weight: parseFloat(form.actual_weight) || 0,
      findings: form.findings,
      acceptance_status: form.acceptance_status,
      rejection_reason: form.acceptance_status === 'rejected' ? form.rejection_reason : null,
    }, { onConflict: 'registration_pet_id' })

    await supabase.from('registration_pets')
      .update({ pet_status: form.acceptance_status === 'rejected' ? 'rejected' : 'on_process' })
      .eq('id', regPetId)

    setExamSaving(prev => ({ ...prev, [regPetId]: false }))
    fetchRegistration()
  }

  async function saveMedical(regPetId: string, petId: string) {
    const form = medForms[regPetId]
    if (!form) return
    setMedSaving(prev => ({ ...prev, [regPetId]: true }))

    await supabase.from('medical_records').upsert({
      registration_pet_id: regPetId,
      pet_id: petId,
      registration_id: id,
      procedure_performed: form.procedure_performed,
      medication_dispensed: form.medication_dispensed,
    }, { onConflict: 'registration_pet_id' })

    setMedSaving(prev => ({ ...prev, [regPetId]: false }))
    fetchRegistration()
  }

  async function saveBilling() {
    setBillingSaving(true)
    const procFee = parseFloat(billing.procedure_fee) || 0
    const medCost = parseFloat(billing.medication_cost) || 0

    const existing = registration?.billing_records?.[0]
    if (existing) {
      await supabase.from('billing_records').update({
        procedure_fee: procFee,
        medication_cost: medCost,
        total_amount: procFee + medCost,
        payment_status: billing.payment_status,
        payment_method: billing.payment_method,
      }).eq('id', existing.id)
    } else {
      await supabase.from('billing_records').insert([{
        registration_id: id,
        procedure_fee: procFee,
        medication_cost: medCost,
        total_amount: procFee + medCost,
        payment_status: billing.payment_status,
        payment_method: billing.payment_method,
      }])
    }
    setBillingSaving(false)
    fetchRegistration()
  }

  async function dischargeAll() {
    if (!registration) return
    const accepted = registration.registration_pets.filter(rp => rp.pet_status !== 'rejected')
    for (const rp of accepted) {
      await supabase.from('registration_pets').update({ pet_status: 'complete' }).eq('id', rp.id)
      await supabase.from('medical_records').update({ discharge_at: new Date().toISOString() })
        .eq('registration_pet_id', rp.id)
    }
    // Create chatbot session
    await supabase.from('chatbot_sessions').insert([{
      registration_id: id,
      status: 'active',
      expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    }])
    fetchRegistration()
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white', boxSizing: 'border-box' as const
  }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 5 }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", background: '#fafafa' }}>
      <div style={{ color: '#999' }}>Loading participant...</div>
    </div>
  )

  if (!registration) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", background: '#fafafa' }}>
      <div style={{ color: '#ef4444' }}>Registration not found.</div>
    </div>
  )

  const owner = registration.owners
  const event = registration.events
  const regPets = registration.registration_pets
  const billingRecord = registration.billing_records?.[0]

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: '#1a0a2e', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/FUR.png" alt="Northern Hills" width={34} height={34} />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Northern Hills</div>
              <div style={{ color: '#39d353', fontSize: 9, letterSpacing: '0.1em', fontWeight: 600 }}>STAFF PANEL</div>
            </div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
              transition: 'all 0.15s'
            }}>{item.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>Sign Out</Link>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 240, padding: 40 }}>

        {/* Back + Header */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: '#7b2d8b',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: 16, padding: 0
          }}>← Back to Dashboard</button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>
                {owner.full_name}
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#999' }}>{owner.contact_number}</span>
                {owner.email && <span style={{ fontSize: 13, color: '#999' }}>· {owner.email}</span>}
                <span style={{
                  background: registration.registration_type === 'walk_in' ? '#fff3e0' : '#e8f5e9',
                  color: registration.registration_type === 'walk_in' ? '#e65100' : '#2e7d32',
                  border: `1px solid ${registration.registration_type === 'walk_in' ? '#ffcc80' : '#81c784'}`,
                  padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
                }}>{registration.registration_type.replace('_', ' ')}</span>
                {registration.queue_number && (
                  <span style={{
                    background: '#f5edf8', color: '#7b2d8b',
                    border: '1px solid #e8d5f0', padding: '2px 10px',
                    borderRadius: 6, fontSize: 11, fontWeight: 700
                  }}>Queue #{registration.queue_number}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a2e' }}>{event?.event_name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {event?.event_date && new Date(event.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {event?.barangay}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '2px solid #e8d5f0' }}>
          {(['overview', 'examination', 'procedure', 'billing', 'discharge'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', background: 'none', border: 'none',
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#7b2d8b' : '#888',
              borderBottom: `2px solid ${activeTab === tab ? '#7b2d8b' : 'transparent'}`,
              marginBottom: -2, cursor: 'pointer', fontFamily: 'inherit',
              textTransform: 'capitalize', transition: 'all 0.15s'
            }}>{tab}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Owner info */}
            <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1.5px solid #e8d5f0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e', marginBottom: 16 }}>Owner Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Full Name', v: owner.full_name },
                  { l: 'Contact', v: owner.contact_number },
                  { l: 'Email', v: owner.email || '—' },
                  { l: 'Address', v: owner.address || '—' },
                  { l: 'Registered', v: new Date(registration.created_at).toLocaleDateString('en-PH') },
                  { l: 'Checked In', v: registration.checked_in_at ? new Date(registration.checked_in_at).toLocaleTimeString('en-PH') : 'Not yet' },
                ].map(row => (
                  <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#999', fontWeight: 600 }}>{row.l}</span>
                    <span style={{ color: '#1a0a2e', fontWeight: 500 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pets summary */}
            <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1.5px solid #e8d5f0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e', marginBottom: 16 }}>Pets ({regPets.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {regPets.map(rp => {
                  const sc = petStatusColors[rp.pet_status]
                  return (
                    <div key={rp.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: '#fafafa',
                      borderRadius: 8, border: '1px solid #f0eaf5'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1a0a2e' }}>{rp.pets.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {rp.pets.species} · {rp.pets.sex} · {rp.pets.age_months}mo · {rp.pets.weight_kg}kg
                        </div>
                      </div>
                      <span style={{
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600
                      }}>{sc.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Billing summary */}
            {billingRecord && (
              <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1.5px solid #e8d5f0' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0a2e', marginBottom: 16 }}>Billing Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { l: 'Procedure Fee', v: `₱${billingRecord.procedure_fee.toLocaleString()}` },
                    { l: 'Medication Cost', v: `₱${billingRecord.medication_cost.toLocaleString()}` },
                    { l: 'Total', v: `₱${billingRecord.total_amount.toLocaleString()}` },
                    { l: 'Payment', v: billingRecord.payment_status },
                    { l: 'Method', v: billingRecord.payment_method || '—' },
                  ].map(row => (
                    <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#999', fontWeight: 600 }}>{row.l}</span>
                      <span style={{ color: '#1a0a2e', fontWeight: row.l === 'Total' ? 700 : 500, textTransform: 'capitalize' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EXAMINATION TAB ── */}
        {activeTab === 'examination' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {regPets.map(rp => {
              const existing = rp.examination_records?.[0]
              const form = examForms[rp.id] || {
                actual_weight: existing?.actual_weight ? String(existing.actual_weight) : String(rp.pets.weight_kg),
                findings: existing?.findings || '',
                acceptance_status: existing?.acceptance_status || 'accepted',
                rejection_reason: existing?.rejection_reason || ''
              }
              return (
                <div key={rp.id} style={{ background: 'white', borderRadius: 14, padding: 24, border: '1.5px solid #e8d5f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>{rp.pets.name}</h3>
                      <div style={{ fontSize: 12, color: '#999' }}>{rp.pets.species} · {rp.pets.sex} · {rp.pets.breed}</div>
                    </div>
                    {existing && (
                      <span style={{
                        background: existing.acceptance_status === 'accepted' ? '#e8f5e9' : '#ffebee',
                        color: existing.acceptance_status === 'accepted' ? '#2e7d32' : '#c62828',
                        border: `1px solid ${existing.acceptance_status === 'accepted' ? '#81c784' : '#ef5350'}`,
                        padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
                      }}>{existing.acceptance_status}</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Actual Weight (kg)</label>
                      <input type="number" value={form.actual_weight}
                        onChange={e => setExamForms(prev => ({ ...prev, [rp.id]: { ...form, actual_weight: e.target.value } }))}
                        style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Acceptance</label>
                      <select value={form.acceptance_status}
                        onChange={e => setExamForms(prev => ({ ...prev, [rp.id]: { ...form, acceptance_status: e.target.value as any } }))}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Physical Findings</label>
                    <textarea value={form.findings}
                      onChange={e => setExamForms(prev => ({ ...prev, [rp.id]: { ...form, findings: e.target.value } }))}
                      placeholder="e.g. Healthy, no abnormalities found"
                      style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} />
                  </div>

                  {form.acceptance_status === 'rejected' && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Rejection Reason</label>
                      <select value={form.rejection_reason}
                        onChange={e => setExamForms(prev => ({ ...prev, [rp.id]: { ...form, rejection_reason: e.target.value } }))}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select reason</option>
                        <option value="too_young">Too Young</option>
                        <option value="sick">Sick</option>
                        <option value="pregnant">Pregnant</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  <button onClick={() => saveExam(rp.id, rp.pets.id)}
                    disabled={examSaving[rp.id]}
                    style={{
                      background: examSaving[rp.id] ? '#b57cc7' : '#7b2d8b',
                      color: 'white', padding: '10px 24px', borderRadius: 8,
                      border: 'none', fontSize: 13, fontWeight: 600,
                      cursor: examSaving[rp.id] ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s'
                    }}>{examSaving[rp.id] ? 'Saving...' : existing ? 'Update Examination' : 'Save Examination'}</button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── PROCEDURE TAB ── */}
        {activeTab === 'procedure' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {regPets.filter(rp => rp.pet_status !== 'rejected').map(rp => {
              const existing = rp.medical_records?.[0]
              const form = medForms[rp.id] || {
                procedure_performed: existing?.procedure_performed || '',
                medication_dispensed: existing?.medication_dispensed || '',
              }
              return (
                <div key={rp.id} style={{ background: 'white', borderRadius: 14, padding: 24, border: '1.5px solid #e8d5f0' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 4 }}>{rp.pets.name}</h3>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>{rp.pets.species} · {rp.pets.sex} · {rp.pets.breed}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Procedure Performed</label>
                      <input value={form.procedure_performed}
                        onChange={e => setMedForms(prev => ({ ...prev, [rp.id]: { ...form, procedure_performed: e.target.value } }))}
                        placeholder="e.g. Ovariohysterectomy"
                        style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Medication Dispensed</label>
                      <input value={form.medication_dispensed}
                        onChange={e => setMedForms(prev => ({ ...prev, [rp.id]: { ...form, medication_dispensed: e.target.value } }))}
                        placeholder="e.g. Amoxicillin 250mg, Meloxicam"
                        style={inputStyle} />
                    </div>
                  </div>

                  <button onClick={() => saveMedical(rp.id, rp.pets.id)}
                    disabled={medSaving[rp.id]}
                    style={{
                      marginTop: 16, background: medSaving[rp.id] ? '#b57cc7' : '#7b2d8b',
                      color: 'white', padding: '10px 24px', borderRadius: 8,
                      border: 'none', fontSize: 13, fontWeight: 600,
                      cursor: medSaving[rp.id] ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s'
                    }}>{medSaving[rp.id] ? 'Saving...' : existing ? 'Update Record' : 'Save Record'}</button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === 'billing' && (
          <div style={{ background: 'white', borderRadius: 14, padding: 28, border: '1.5px solid #e8d5f0', maxWidth: 560 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>Billing Record</h3>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
              Male Cat ₱600 · Female Cat ₱800 · Male Dog ₱1,300 · Female Dog ₱1,800
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Procedure Fee (₱)</label>
                  <input type="number" value={billing.procedure_fee}
                    onChange={e => setBilling({ ...billing, procedure_fee: e.target.value })}
                    placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Medication Cost (₱)</label>
                  <input type="number" value={billing.medication_cost}
                    onChange={e => setBilling({ ...billing, medication_cost: e.target.value })}
                    placeholder="0.00" style={inputStyle} />
                </div>
              </div>

              <div style={{
                background: '#f5edf8', borderRadius: 10, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#7b2d8b' }}>Total Amount</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#7b2d8b' }}>
                  ₱{((parseFloat(billing.procedure_fee) || 0) + (parseFloat(billing.medication_cost) || 0)).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Payment Status</label>
                  <select value={billing.payment_status}
                    onChange={e => setBilling({ ...billing, payment_status: e.target.value as any })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={billing.payment_method}
                    onChange={e => setBilling({ ...billing, payment_method: e.target.value as any })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button onClick={saveBilling} disabled={billingSaving} style={{
                background: billingSaving ? '#b57cc7' : '#7b2d8b',
                color: 'white', padding: '12px', borderRadius: 10,
                border: 'none', fontSize: 14, fontWeight: 700,
                cursor: billingSaving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s'
              }}>{billingSaving ? 'Saving...' : billingRecord ? 'Update Billing' : 'Save Billing'}</button>
            </div>
          </div>
        )}

        {/* ── DISCHARGE TAB ── */}
        {activeTab === 'discharge' && (
          <div style={{ background: 'white', borderRadius: 14, padding: 28, border: '1.5px solid #e8d5f0', maxWidth: 560 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>Discharge Patient</h3>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
              Confirm discharge for all accepted pets. This will mark them as complete and activate the post-op AI chatbot for the owner.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {regPets.map(rp => {
                const sc = petStatusColors[rp.pet_status]
                return (
                  <div key={rp.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0eaf5'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{rp.pets.name}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{rp.pets.species} · {rp.pets.sex}</div>
                    </div>
                    <span style={{
                      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600
                    }}>{sc.label}</span>
                  </div>
                )
              })}
            </div>

            {regPets.some(rp => rp.pet_status === 'complete') ? (
              <div style={{
                background: '#e8f5e9', border: '1px solid #81c784',
                borderRadius: 10, padding: '14px 18px', color: '#2e7d32',
                fontSize: 13, fontWeight: 600, textAlign: 'center'
              }}>✓ Patient has been discharged</div>
            ) : (
              <button onClick={dischargeAll} style={{
                width: '100%', background: '#39d353', color: 'white',
                padding: '13px', borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s'
              }}>Confirm Discharge & Activate Chatbot</button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}