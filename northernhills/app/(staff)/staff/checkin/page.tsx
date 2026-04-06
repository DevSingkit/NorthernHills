'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type ScanResult = {
  status: 'success' | 'already' | 'notfound' | 'error'
  message: string
  owner?: string
  queue?: number
  pets?: number
}

const sideNav = [
  { label: 'Dashboard',    href: '/staff', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: 'Walk-In',      href: '/staff/walkin',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
  { label: 'QR Check-In',  href: '/staff/checkin',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg> },
  { label: 'Messages',     href: '/staff/messages',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { label: 'Chat History', href: '/staff/chats',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
]

export default function CheckInPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [activeNav, setActiveNav] = useState('QR Check-In')
  const [cameraOn, setCameraOn] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [manualToken, setManualToken] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    return () => stopCamera()
  }, [])

 async function startCamera() {
  setCameraError('')
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }
    setCameraOn(true)
    setScanning(true)
    startScanning()
  } catch (err: any) {
    setCameraError(`Camera error: ${err.name} — ${err.message}`)
  }
}

  function stopCamera() {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOn(false)
    setScanning(false)
  }

  function startScanning() {
    // Use BarcodeDetector API if available
    if ('BarcodeDetector' in window) {
      // @ts-ignore
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return
        try {
          // @ts-ignore
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue
            stopCamera()
            await processToken(raw)
          }
        } catch {}
      }, 500)
    } else {
      // Fallback: canvas frame grab + manual decode attempt
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)
      }, 500)
      setCameraError('Auto-scan not supported in this browser. Scan and copy the QR code value, then use manual entry.')
    }
  }

  async function processToken(token: string) {
    setResult(null)
    // token could be a full URL like https://site.com/chatbot/{uuid}
    // or just the qr_token UUID stored in registrations
    const clean = token.includes('/') ? token.split('/').pop()! : token

    const { data, error } = await supabase
      .from('registrations')
      .select('id, checked_in_at, queue_number, owners(full_name), registration_pets(id)')
      .eq('qr_token', clean)
      .single()

    if (error || !data) {
      setResult({ status: 'notfound', message: 'QR code not found in the system. Please verify the registration.' })
      return
    }

    if (data.checked_in_at) {
      setResult({
        status: 'already',
        message: 'This participant has already been checked in.',
        owner: (data.owners as any)?.full_name,
        queue: data.queue_number ?? undefined,
        pets: (data.registration_pets as any[])?.length
      })
      return
    }

    // Assign queue number
    const { data: queueData } = await supabase
      .rpc('get_next_queue_number', { p_event_id: data.id })

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        checked_in_at: new Date().toISOString(),
        queue_number: queueData ?? null
      })
      .eq('id', data.id)

    if (updateError) {
      setResult({ status: 'error', message: 'Failed to check in. Please try again.' })
      return
    }

    setResult({
      status: 'success',
      message: 'Check-in successful!',
      owner: (data.owners as any)?.full_name,
      queue: queueData ?? data.queue_number,
      pets: (data.registration_pets as any[])?.length
    })
  }

  async function handleManual() {
    if (!manualToken.trim()) return
    setManualLoading(true)
    await processToken(manualToken.trim())
    setManualLoading(false)
    setManualToken('')
  }

  const resultStyles = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '✓' },
    already: { bg: '#fff8f0', border: '#fcd34d', color: '#92400e', icon: '!' },
    notfound: { bg: '#fff0f0', border: '#fca5a5', color: '#991b1b', icon: '✕' },
    error:    { bg: '#fff0f0', border: '#fca5a5', color: '#991b1b', icon: '✕' },
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
      <main style={{ marginLeft: 220, flex: 1, padding: '40px 48px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 4 }}>QR Check-In</h1>
          <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
            Scan a participant's QR code to check them in and assign a queue number.
          </p>

          {/* CAMERA BOX */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 28,
            border: '1.5px solid #e8d5f0', marginBottom: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e' }}>Camera Scanner</h2>
              {scanning && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 99, background: 'rgba(57,211,83,0.1)',
                  color: '#39d353', border: '1px solid rgba(57,211,83,0.3)'
                }}>● Scanning</span>
              )}
            </div>

            {/* Video feed */}
            <div style={{
              width: '100%', aspectRatio: '4/3', background: '#0f0620',
              borderRadius: 12, overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: cameraOn ? 'block' : 'none'
                }}
                muted playsInline
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {!cameraOn && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                    <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/>
                    <rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                    <path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                    <path d="M3 12h.01"/><path d="M12 3h.01"/>
                  </svg>
                  <div style={{ fontSize: 13 }}>Camera is off</div>
                </div>
              )}

              {/* Scan overlay */}
              {cameraOn && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                }}>
                  <div style={{
                    width: 200, height: 200, position: 'relative'
                  }}>
                    {/* Corner brackets */}
                    {[
                      { top: 0, left: 0, borderTop: '3px solid #39d353', borderLeft: '3px solid #39d353' },
                      { top: 0, right: 0, borderTop: '3px solid #39d353', borderRight: '3px solid #39d353' },
                      { bottom: 0, left: 0, borderBottom: '3px solid #39d353', borderLeft: '3px solid #39d353' },
                      { bottom: 0, right: 0, borderBottom: '3px solid #39d353', borderRight: '3px solid #39d353' },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div style={{
                background: '#fff8f0', border: '1px solid #fcd34d',
                borderRadius: 8, padding: '10px 14px', fontSize: 12,
                color: '#92400e', marginBottom: 12
              }}>{cameraError}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              {!cameraOn ? (
                <button onClick={startCamera} style={{
                  flex: 1, background: '#7b2d8b', color: 'white',
                  padding: '12px', borderRadius: 10, border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s'
                }}>Start Camera</button>
              ) : (
                <button onClick={stopCamera} style={{
                  flex: 1, background: '#fff0f0', color: '#ef4444',
                  padding: '12px', borderRadius: 10, border: '1px solid #fecaca',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s'
                }}>Stop Camera</button>
              )}
            </div>
          </div>

          {/* MANUAL ENTRY */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 28,
            border: '1.5px solid #e8d5f0', marginBottom: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 6 }}>Manual Entry</h2>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
              Paste the QR token or full URL if camera scanning doesn't work.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManual()}
                placeholder="Paste QR token or URL here..."
                style={{
                  flex: 1, padding: '11px 14px',
                  border: '1.5px solid #e8d5f0', borderRadius: 8,
                  fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1a1a1a'
                }}
              />
              <button onClick={handleManual} disabled={manualLoading || !manualToken.trim()} style={{
                background: manualLoading || !manualToken.trim() ? '#d8b4e2' : '#7b2d8b',
                color: 'white', padding: '11px 20px', borderRadius: 8,
                border: 'none', fontSize: 13, fontWeight: 700,
                cursor: manualLoading || !manualToken.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap'
              }}>{manualLoading ? 'Checking...' : 'Check In'}</button>
            </div>
          </div>

          {/* RESULT */}
          {result && (() => {
            const s = resultStyles[result.status]
            return (
              <div style={{
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 16, padding: 24,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: result.owner ? 16 : 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: s.border, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, flexShrink: 0
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{result.message}</div>
                  </div>
                </div>

                {result.owner && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
                    marginTop: 12, paddingTop: 16, borderTop: `1px solid ${s.border}`
                  }}>
                    {[
                      { l: 'Owner', v: result.owner },
                      { l: 'Queue #', v: result.queue ? `#${result.queue}` : 'Assigned' },
                      { l: 'Pets', v: `${result.pets} pet${result.pets !== 1 ? 's' : ''}` },
                    ].map(row => (
                      <div key={row.l}>
                        <div style={{ fontSize: 10, color: s.color, fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>{row.l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{row.v}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); startCamera() }}
                  style={{
                    marginTop: 16, width: '100%', background: '#1a0a2e',
                    color: 'white', padding: '11px', borderRadius: 10,
                    border: 'none', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                  }}>Scan Next</button>
              </div>
            )
          })()}

        </div>
      </main>
    </div>
  )
}