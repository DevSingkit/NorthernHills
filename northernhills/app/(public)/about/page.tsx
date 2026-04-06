import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', color: '#1a1a1a' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1a0a2e', padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
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
              color: label === 'About' ? 'white' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              fontWeight: label === 'About' ? 700 : 500,
              transition: 'color 0.15s'
            }}>{label}</Link>
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

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1050 60%, #1a0a2e 100%)',
        padding: '96px 40px 80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(57,211,83,0.12)',
            border: '1px solid rgba(57,211,83,0.3)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39d353' }} />
            <span style={{ color: '#39d353', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
              CALOOCAN CITY, PHILIPPINES
            </span>
          </div>
          <h1 style={{
            fontSize: 48, fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: 20
          }}>
            Supporting animal health<br />
            <span style={{ color: '#39d353' }}>for a healthier community.</span>
          </h1>
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8, maxWidth: 560, margin: '0 auto'
          }}>
            Northern Hills Veterinary Clinic is a full-service animal hospital
            committed to improving animal health — and through it, the health
            of the communities we serve.
          </p>
        </div>
      </section>

      {/* ── QUICK INFO STRIP ── */}
      <section style={{ background: '#7b2d8b', padding: '0 40px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderLeft: '1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              ),
              label: 'Location',
              value: 'Unit 18 Adeline Comm\'l Bldg., Quirino Hwy., Brgy. 182 Pangarap (North), Caloocan City'
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.8-1.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              ),
              label: 'Contact',
              value: '0927 867 8760'
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              ),
              label: 'Email',
              value: 'northernhillsvet@gmail.com'
            },
          ].map((item, i) => (
            <div key={item.label} style={{
              padding: '22px 32px',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'flex-start', gap: 14
            }}>
              <div style={{ color: '#39d353', marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
                  {item.label.toUpperCase()}
                </div>
                <p style={{ color: 'white', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT THE CLINIC ── */}
      <section style={{ padding: '96px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#7b2d8b', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 14 }}>
              ABOUT THE CLINIC
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a0a2e', marginBottom: 20, lineHeight: 1.2 }}>
              Northern Hills Veterinary Clinic
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 16 }}>
              Located in Caloocan City, Northern Hills Veterinary Clinic (NHVC) is
              a full-service animal hospital providing quality veterinary care to
              the community. We treat cats, dogs, and other companion animals with
              the compassion and professionalism every pet deserves.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 16 }}>
              Beyond the clinic walls, NHVC actively participates in community
              outreach programs. We partner with organizations and local government
              units to bring veterinary services directly to underserved barangays —
              because we believe animal health and community health are inseparable.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 32 }}>
              Our outreach work has taken us as far as Siargao, where we partnered
              with Be Pawsitive Siargao to bring veterinary products and services
              to those in need. <em>One paw at a time.</em>
            </p>

            {/* Clinic details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Address', value: 'Unit 18, Adeline Comm\'l Bldg., Quirino Hwy., Brgy. 182 Pangarap (North), Caloocan City' },
                { label: 'Phone', value: '0927 867 8760' },
                { label: 'Email', value: 'northernhillsvet@gmail.com' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#7b2d8b',
                    letterSpacing: '0.08em', minWidth: 56, marginTop: 1
                  }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{item.value}</div>
                </div>
              ))}
              
            </div>
          </div>

          {/* Clinic photo */}
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            background: '#f5edf8', border: '1px solid #e8d5f0',
            aspectRatio: '4/3', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            position: 'relative'
          }}>
            {
              <Image src="/images/clinic.jpg" alt="Northern Hills Veterinary Clinic" fill style={{ objectFit: 'cover' }} />
            }
            
          </div>
        </div>
      </section>

      {/* ── THE SNP OUTREACH PROGRAM ── */}
      <section style={{ padding: '96px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

            {/* Photo placeholder */}
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: '#f5edf8', border: '1px solid #e8d5f0',
              aspectRatio: '4/3', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              position: 'relative'
            }}>
              {
                <Image src="/images/kapon.jpg" alt="Outreach Event" fill style={{ objectFit: 'cover' }} />
              }
              
            </div>

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(57,211,83,0.12)', border: '1px solid rgba(57,211,83,0.3)',
                borderRadius: 99, padding: '5px 14px', marginBottom: 20
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39d353' }} />
                <span style={{ color: '#39d353', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
                  STRAY NEUTER PROJECT
                </span>
              </div>

              <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a0a2e', marginBottom: 20, lineHeight: 1.2 }}>
                Kapon ang solusyon.
              </h2>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 16 }}>
                The Stray Neuter Project (SNP) is NHVC&apos;s community outreach initiative
                dedicated to controlling stray animal overpopulation through affordable
                spay and neuter services brought directly to the barangay.
              </p>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 28 }}>
                Through the SNP, pet owners can register their cats and dogs for
                low-cost procedures. Walk-in clients are always welcome. Each event
                follows a structured process — from QR check-in to post-operative
                recovery support via AI chatbot.
              </p>

              {/* Requirements summary from poster */}
              <div style={{
                background: '#fafafa', borderRadius: 12,
                border: '1px solid #ede8f3', padding: '20px 24px',
                marginBottom: 24
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7b2d8b', letterSpacing: '0.08em', marginBottom: 14 }}>
                  GENERAL REQUIREMENTS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Pet must be perfectly healthy — no health issues',
                    'Cats: secured cage or carrier with name-tag. Dogs: leash with name-tag',
                    'Age: Male 4 months minimum · Female 6 months minimum · up to 5 years old',
                    'At least 6 hours fasting — no food or water before surgery',
                    'CBC required for all dogs and cats 2 years and older',
                    'All cats require ear marking (Notch or Tattoo)',
                  ].map((req, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(57,211,83,0.12)',
                        border: '1px solid rgba(57,211,83,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39d353' }} />
                      </div>
                      <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#7b2d8b', color: 'white',
                padding: '13px 28px', borderRadius: 10,
                textDecoration: 'none', fontWeight: 700, fontSize: 14,
                transition: 'background 0.15s', cursor: 'pointer'
              }}>
                Pre-Register for an Event
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCEDURE RATES ── */}
      <section style={{ padding: '96px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#7b2d8b', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              PROCEDURE RATES
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a0a2e', marginBottom: 12 }}>
              Low-cost. Transparent. No hidden fees.
            </h2>
            <p style={{ color: '#888', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Rates may vary per event. The prices below are standard SNP rates.
              A ₱50 registration fee per pet is deducted from your final bill.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Male Cat', rate: '₱600', icon: '♂', type: 'cat' },
              { label: 'Female Cat', rate: '₱800', icon: '♀', type: 'cat' },
              { label: 'Male Dog', rate: '₱1,300', icon: '♂', type: 'dog' },
              { label: 'Female Dog', rate: '₱1,800', icon: '♀', type: 'dog' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'white', borderRadius: 16, padding: '28px 24px',
                border: '1.5px solid #ede8f3', textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.15s'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#f5edf8', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#7b2d8b', fontWeight: 700
                }}>{item.icon}</div>
                <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em' }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#7b2d8b', lineHeight: 1 }}>
                  {item.rate}
                </div>
              </div>
            ))}
          </div>

          {/* Fine print */}
          <div style={{
            background: 'white', borderRadius: 12, padding: '20px 28px',
            border: '1px solid #ede8f3', display: 'flex', flexWrap: 'wrap', gap: 16
          }}>
            {[
              'For dogs 10 kg and below only',
              'Above 10 kg: additional ₱100 per kg excess',
              'Walk-in registration fee: ₱50 per pet',
              'Registration fee deducted from total bill',
              'Additional charge for pregnant pets or reproductive abnormalities',
              'No refunds if owner fails to attend',
            ].map((note, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7b2d8b', flexShrink: 0 }} />
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY COMMITMENT ── */}
      <section style={{ background: '#1a0a2e', padding: '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(57,211,83,0.15)',
            border: '1px solid rgba(57,211,83,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#39d353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <blockquote style={{
            fontSize: 20, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.75, fontStyle: 'italic',
            maxWidth: 700, margin: '0 auto 24px'
          }}>
            &ldquo;In line with our mission to improve animal health — leading to a healthier
            community — we are honored to support initiatives that bring veterinary
            care to those in need. Together, we make a difference — one paw at a time.&rdquo;
          </blockquote>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
            NORTHERN HILLS VETERINARY CLINIC
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {['#KaponAngSolusyon', '#AnimalHealth', '#CommunityCare', '#ResponsiblePetOwnership'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(123,45,139,0.3)',
                border: '1px solid rgba(123,45,139,0.4)',
                color: 'rgba(255,255,255,0.6)',
                padding: '4px 12px', borderRadius: 99,
                fontSize: 12, fontWeight: 500
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '96px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#7b2d8b', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              OUR VALUES
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a0a2e' }}>
              What drives everything we do.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: 'Community first',
                desc: 'We bring the clinic to the barangay — not the other way around. Every outreach event is designed around the community\'s schedule and location.'
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                ),
                title: 'Accessible care',
                desc: 'Low-cost procedures, transparent pricing, and walk-in accommodation ensure that no pet owner is turned away due to financial barriers.'
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b2d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ),
                title: 'End-to-end support',
                desc: 'From pre-op instructions to 10-day post-op AI chatbot support — every participant receives continuous care, not just a one-time procedure.'
              },
            ].map(item => (
              <div key={item.title} style={{
                background: '#fafafa', borderRadius: 16, padding: '32px 28px',
                border: '1px solid #ede8f3',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: '#f5edf8', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20
                }}>{item.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a0a2e', marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        margin: '0 40px 80px', borderRadius: 20,
        background: 'linear-gradient(135deg, #2d1050 0%, #7b2d8b 100%)',
        padding: '72px 64px',
        display: 'grid', gridTemplateColumns: '1fr auto',
        alignItems: 'center', gap: 40
      }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 14, lineHeight: 1.2 }}>
            Join our next outreach event.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: 0 }}>
            Pre-register online to receive your QR code and pre-op instructions,
            or walk in on the day. Both are always welcome.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          <Link href="/register" style={{
            background: '#39d353', color: '#1a0a2e',
            padding: '15px 36px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 800, fontSize: 15,
            textAlign: 'center', transition: 'background 0.15s', cursor: 'pointer'
          }}>Pre-Register Online</Link>
          <Link href="/contact" style={{
            background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.35)',
            padding: '14px 36px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 15,
            textAlign: 'center', transition: 'all 0.15s', cursor: 'pointer'
          }}>Contact Us</Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f0620', padding: '64px 40px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48, marginBottom: 56
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Image src="/FUR.png" alt="Northern Hills" width={40} height={40} />
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
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>RESOURCES</div>
              {[['Privacy Policy', '/about'], ['Terms of Use', '/about'], ['FAQ', '/contact']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>CONTACT</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 2 }}>
                <div>0927 867 8760</div>
                <div style={{ marginTop: 4, color: '#39d353' }}>northernhillsvet@gmail.com</div>
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
                <Link key={item} href="/about" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}