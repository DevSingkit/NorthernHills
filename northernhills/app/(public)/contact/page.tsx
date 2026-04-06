'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', color: '#1a1a1a' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1a0a2e', padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {<Image src="/FUR.png" alt="Northern Hills" width={44} height={44} />}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>Northern Hills</div>
            <div style={{ color: '#39d353', fontSize: 10, letterSpacing: '0.12em', fontWeight: 600 }}>VETERINARY CLINIC</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14 }}>
          {[['Home', '/'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
            <Link key={label} href={href}
              style={{ color: label === 'Contact' ? 'white' : 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: label === 'Contact' ? 700 : 500 }}>
              {label}
            </Link>
          ))}
          
          <Link href="/login" style={{
            background: 'transparent', color: 'rgba(255,255,255,0.75)',
            padding: '9px 22px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            textDecoration: 'none', fontWeight: 500, fontSize: 14,
            transition: 'all 0.15s'
          }}>Sign In</Link>
          <Link href="/register" style={{
            background: '#7b2d8b', color: 'white',
            padding: '9px 22px', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
            transition: 'background 0.15s'
          }}>Register Now</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1050 60%, #1a0a2e 100%)',
        padding: '80px 40px', textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(57,211,83,0.12)', border: '1px solid rgba(57,211,83,0.3)',
          borderRadius: 99, padding: '6px 16px', marginBottom: 24
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39d353' }} />
          <span style={{ color: '#39d353', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
            WE&apos;RE HERE TO HELP
          </span>
        </div>
        <h1 style={{
          fontSize: 48, fontWeight: 800, color: 'white',
          lineHeight: 1.15, marginBottom: 16
        }}>
          We&apos;re Here for You<br />
          <span style={{ color: '#39d353' }}>and Your Pets</span>
        </h1>
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.75, maxWidth: 480, margin: '0 auto'
        }}>
          Have questions about pet care or our outreach program? Our team is ready to assist you.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <section style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48
        }}>

          {/* Left — contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a0a2e', marginBottom: 8 }}>Get in Touch</h2>
              <p style={{ fontSize: 15, color: '#777', lineHeight: 1.7 }}>
                Reach us through any of the channels below or send us a message directly.
              </p>
            </div>

            {[
              {
                icon: '📞',
                label: 'Phone',
                value: '+63 927 867 8760',
                sub: 'Mon–Fri, 10am to 6pm',
                href: 'tel:+639278678760'
              },
              {
                icon: '✉️',
                label: 'Email',
                value: 'northernhillsvet@gmail.com',
                sub: 'We reply within 24 hours',
                href: 'mailto:northernhillsvet@gmail.com'
              },
              {
                icon: '📍',
                label: 'Address',
                value: 'Unit 18 Adeline Quirino Hwy, Barangay 184 Tala, Caloocan City, 1427 Metro Manila, Philippines',
                sub: 'Philippines',
                href: null
              },
              {
                icon: '🕐',
                label: 'Office Hours',
                value: 'Monday – Friday',
                sub: '8:00 AM – 5:00 PM',
                href: null
              },
            ].map(item => (
              <div key={item.label} style={{
                background: 'white', borderRadius: 14,
                padding: '20px 24px', border: '1px solid #ede8f3',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                display: 'flex', gap: 16, alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: '#f5edf8', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7b2d8b', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {item.label.toUpperCase()}
                  </div>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: 15, fontWeight: 600, color: '#1a0a2e', textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a0a2e' }}>{item.value}</div>
                  )}
                  <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — contact form */}
          <div style={{
            background: 'white', borderRadius: 16, padding: 40,
            border: '1px solid #ede8f3',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)'
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(57,211,83,0.12)', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28
                }}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 10 }}>
                  Message Sent!
                </h3>
                <p style={{ color: '#777', fontSize: 15, lineHeight: 1.7 }}>
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  style={{
                    marginTop: 24, background: '#f5edf8', color: '#7b2d8b',
                    border: 'none', padding: '10px 24px', borderRadius: 8,
                    fontWeight: 600, fontSize: 14, cursor: 'pointer'
                  }}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a2e', marginBottom: 6 }}>
                  Send Us a Message
                </h2>
                <p style={{ fontSize: 14, color: '#999', marginBottom: 28 }}>
                  Whether it&apos;s about your pet&apos;s care or our services, we&apos;d love to hear from you.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                      Full Name
                    </label>
                    <input
                      placeholder="Juan dela Cruz"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{
                        width: '100%', padding: '11px 14px',
                        border: '1.5px solid #e8d5f0', borderRadius: 8,
                        fontSize: 14, outline: 'none', fontFamily: 'inherit',
                        color: '#1a1a1a', background: 'white'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                      Email Address
                    </label>
                    <input
                      placeholder="juan@email.com"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{
                        width: '100%', padding: '11px 14px',
                        border: '1.5px solid #e8d5f0', borderRadius: 8,
                        fontSize: 14, outline: 'none', fontFamily: 'inherit',
                        color: '#1a1a1a', background: 'white'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                    Subject
                  </label>
                  <input
                    placeholder="e.g. Question about spay procedure"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: '1.5px solid #e8d5f0', borderRadius: 8,
                      fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      color: '#1a1a1a', background: 'white'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us how we can help you..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: '1.5px solid #e8d5f0', borderRadius: 8,
                      fontSize: 14, outline: 'none', fontFamily: 'inherit',
                      color: '#1a1a1a', background: 'white',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#b57cc7' : '#7b2d8b',
                    color: 'white', border: 'none',
                    borderRadius: 10, fontSize: 15,
                    fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.2s'
                  }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f0620', padding: '64px 40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48, marginBottom: 56
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {<Image src="/FUR.png" alt="Northern Hills" width={44} height={44} />}
                          </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Northern Hills</div>
                  <div style={{ color: '#39d353', fontSize: 10, letterSpacing: '0.1em' }}>VETERINARY CLINIC</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.8, maxWidth: 260 }}>
                Unit 18, Adeline Comm&apos;l Bldg., Quirino Hwy.,
                Brgy. 182 Pangarap (North), Caloocan City
              </p>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>QUICK LINKS</div>
              {[['Home', '/'], ['Register', '/register'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>RESOURCES</div>
              {[['Privacy Policy', '/about'], ['Terms of Use', '/about'], ['FAQ', '/contact']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>CONTACT</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 2 }}>
                <div>0927 867 8760</div>
                <div style={{ marginTop: 8, color: '#39d353' }}>contact@northernhills.vet</div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 24, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              © 2025 Northern Hills Veterinary Clinic. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Terms', 'Privacy'].map(item => (
                <Link key={item} href="/about"
                  style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}