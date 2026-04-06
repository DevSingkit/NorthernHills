'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Tab = 'accounts' | 'staff' 

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('accounts')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

async function handleLogin() {
  setError('')
  setLoading(true)

  // 1. Sign in to Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    setError('Invalid email or password.')
    setLoading(false)
    return
  }

  const userId = authData.user.id

  if (tab === 'accounts') {
    // Check 'accounts' table for Pet Owners
    // Columns: id, owner_id, auth_user_id, last_login, created_at
    const { data: accountData, error: dbError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', userId)
      .single()

    if (dbError || !accountData) {
      setError('Pet Owner profile not found in the accounts table.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'

  } else {
    // Check 'staff_accounts' table for Staff/Admin
    // Columns: id, full_name, email, role, auth_user_id, etc.
    const { data: staffData, error: staffError } = await supabase
      .from('staff_accounts')
      .select('role')
      .eq('auth_user_id', userId)
      .single()

    if (staffError || !staffData) {
      setError('Staff/Admin account not found in the staff_accounts table.')
      setLoading(false)
      return
    }

    // Redirect based on your specific folder structure
    if (staffData.role === 'admin') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/staff'
    }
  }

  setLoading(false)
}

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e8d5f0', borderRadius: 8,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    color: '#1a1a1a', background: 'white',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600, color: '#444', marginBottom: 6
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── NAVBAR — outside the grid, spans full width ── */}
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
          <Link href="/register" style={{
            background: '#7b2d8b', color: 'white',
            padding: '9px 22px', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600, fontSize: 14
          }}>Register</Link>
        </div>
      </nav>

      {/* ── SPLIT LAYOUT — below the navbar ── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1.4fr'
      }}>

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
                WELCOME BACK
              </span>
            </div>

            <h1 style={{
              fontSize: 38, fontWeight: 800, color: 'white',
              lineHeight: 1.2, marginBottom: 16
            }}>
              Sign in to your<br />
              <span style={{ color: '#39d353' }}>
                {tab === 'accounts' ? 'Pet Owner Account' : 'Staff Account'}
              </span>
            </h1>

            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.8, marginBottom: 40, maxWidth: 320
            }}>
              {tab === 'accounts'
                ? 'Access your pet profiles, past registrations, and post-op chatbot links.'
                : 'Access the staff dashboard, manage participants, and track event progress.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(tab === 'accounts' ? [
                'View your registered pets',
                'See past activities',
                'Access chatbot sessions',
                'Request history',
              ] : [
                'Manage event participants',
                'QR code check-in scanner',
                'Record examinations and billing',
                'View chatbot conversations',
              ]).map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(57,211,83,0.2)',
                    border: '1px solid rgba(57,211,83,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 11, color: '#39d353', fontWeight: 800
                  }}>✓</div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 48 }}>
            © 2025 Northern Hills Veterinary Clinic
          </p>
        </div>

        {/* RIGHT — form panel */}
        <div style={{
          background: '#fafafa', padding: '48px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', overflowY: 'auto'
        }}>
          <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>

            {/* Tab switcher */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: '#f0e8f5', borderRadius: 12,
              padding: 4, marginBottom: 36
            }}>
              {(['accounts', 'staff'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setEmail(''); setPassword('') }}
                  style={{
                    padding: '10px 0',
                    background: tab === t ? 'white' : 'transparent',
                    border: 'none', borderRadius: 9,
                    fontSize: 14, fontWeight: tab === t ? 700 : 500,
                    color: tab === t ? '#7b2d8b' : '#aaa',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}>
                  {t === 'accounts' ? 'Pet Owner' : 'Staff / Admin'}
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
              {tab === 'accounts' ? 'Pet Owner Login' : 'Staff Login'}
            </h2>
            <p style={{ fontSize: 14, color: '#999', marginBottom: 32 }}>
              {tab === 'accounts'
                ? 'Sign in to manage your pets and registrations.'
                : 'Staff and admin accounts are created by your administrator.'}
            </p>

            {error && (
              <div style={{
                background: '#fff0f0', border: '1px solid #fecaca',
                color: '#ef4444', borderRadius: 8,
                padding: '12px 16px', fontSize: 13, marginBottom: 20
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  {tab === 'accounts' && (
                    <Link href="/forgot-password" style={{ fontSize: 12, color: '#7b2d8b', textDecoration: 'none', fontWeight: 600 }}>
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              style={{
                marginTop: 28, width: '100%', padding: '14px',
                background: loading || !email || !password ? '#d8b4e2' : '#7b2d8b',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s'
              }}>
              {loading ? 'Signing in...' : `Sign in as ${tab === 'accounts' ? 'Pet Owner' : 'Staff'}`}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 12, margin: '24px 0'
            }}>
              <div style={{ flex: 1, height: 1, background: '#ede8f3' }} />
              <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#ede8f3' }} />
            </div>

            {tab === 'accounts' ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#999', marginBottom: 12 }}>
                  Don&apos;t have an account?
                </p>
                <Link href="/account" style={{
                  display: 'block', padding: '13px',
                  background: 'white', color: '#7b2d8b',
                  border: '1.5px solid #e8d5f0', borderRadius: 10,
                  textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  textAlign: 'center'
                }}>Create an account</Link>
              </div>
            ) : (
              <div style={{
                background: '#f5edf8', borderRadius: 10,
                padding: '16px 20px', textAlign: 'center'
              }}>
                <p style={{ fontSize: 13, color: '#7b2d8b', lineHeight: 1.6 }}>
                  Staff accounts are created by your admin.<br />
                  Contact your administrator if you need access.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}