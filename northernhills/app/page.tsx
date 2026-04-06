'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
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
              color: label === 'Home' ? 'white' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none', fontWeight: label === 'Home' ? 700 : 500,
              transition: 'color 0.15s'
            }}>{label}</Link>
          ))}
          <Link href="/login" style={{
            background: 'transparent', color: 'rgba(255,255,255,0.75)',
            padding: '9px 22px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
            textDecoration: 'none', fontWeight: 500, fontSize: 14, transition: 'all 0.15s'
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
        padding: '100px 40px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        alignItems: 'center', gap: 60, minHeight: '90vh'
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(57,211,83,0.12)', border: '1px solid rgba(57,211,83,0.3)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39d353' }} />
            <span style={{ color: '#39d353', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
              COMMUNITY SPAY & NEUTER OUTREACH
            </span>
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 800, color: 'white', lineHeight: 1.12, marginBottom: 24 }}>
            Your Pet&apos;s Care<br />
            <span style={{ color: '#39d353' }}>Starts Here.</span>
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75, marginBottom: 40, maxWidth: 460
          }}>
            Northern Hills Veterinary Clinic brings low-cost spay and neuter services
            directly to your barangay. Register online before the event or walk in on the day —
            both are welcome.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#7b2d8b', color: 'white',
              padding: '15px 36px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              boxShadow: '0 4px 20px rgba(123,45,139,0.5)',
              transition: 'background 0.15s'
            }}>Pre-Register Online</Link>
            <Link href="/about" style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', padding: '15px 36px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
              transition: 'background 0.15s'
            }}>Learn More</Link>
          </div>

          <div style={{
            display: 'flex', gap: 40, marginTop: 56,
            paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {[
              { n: '500+', l: 'Pets Served' },
              { n: '20+', l: 'Barangays Reached' },
              { n: 'Low Cost', l: 'For Everyone' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#39d353' }}>{s.n}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div style={{
          borderRadius: 20, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          aspectRatio: '4/3', 
          position: 'relative',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          flexDirection: 'column', 
          gap: 10
        }}>
          <Image src="/images/pet.jpg" alt="Pet Care" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* ── TWO PATHS ── */}
      <section style={{ padding: '96px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#7b2d8b', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              TWO WAYS TO JOIN
            </p>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#1a0a2e', marginBottom: 16 }}>
              Pre-register or walk in — your choice.
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Both paths are fully supported. Pre-registering gives you a QR code and personalized
              pre-op instructions. Walk-ins are registered on-site by staff.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* Pre-registration path */}
            <div style={{
              background: 'white', borderRadius: 16, padding: 40,
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f0eaf5'
            }}>
              <div style={{
                display: 'inline-block', background: '#f5edf8', color: '#7b2d8b',
                fontSize: 12, fontWeight: 700, padding: '6px 14px',
                borderRadius: 99, marginBottom: 32, letterSpacing: '0.08em'
              }}>PRE-REGISTRATION (ONLINE)</div>

              {[
                { n: '1', t: 'Fill in the registration form', d: 'Enter your details and each pet\'s info. Select the outreach event. Optionally create an account — never required.' },
                { n: '2', t: 'Receive your QR code', d: 'A unique QR code is generated covering all your pets. Pre-op instructions are sent to your email or SMS.' },
                { n: '3', t: 'Arrive and scan in', d: 'Show your QR code on event day. Staff scans it and assigns your queue number on arrival.' },
                { n: '4', t: 'Post-op AI chatbot', d: 'After discharge, you receive a 10-day AI chatbot link for recovery guidance and wound care questions.' },
              ].map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 18, marginBottom: i < 3 ? 28 : 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#7b2d8b', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a0a2e', marginBottom: 6 }}>{step.t}</div>
                    <div style={{ fontSize: 14, color: '#777', lineHeight: 1.65 }}>{step.d}</div>
                  </div>
                </div>
              ))}

              <Link href="/register" style={{
                display: 'block', marginTop: 32, textAlign: 'center',
                background: '#7b2d8b', color: 'white',
                padding: '13px', borderRadius: 10,
                textDecoration: 'none', fontWeight: 700, fontSize: 15,
                transition: 'background 0.15s', cursor: 'pointer'
              }}>Pre-Register Now</Link>
            </div>

            {/* Walk-in path */}
            <div style={{ background: '#1a0a2e', borderRadius: 16, padding: 40 }}>
              <div style={{
                display: 'inline-block', background: 'rgba(57,211,83,0.15)',
                color: '#39d353', fontSize: 12, fontWeight: 700,
                padding: '6px 14px', borderRadius: 99, marginBottom: 32, letterSpacing: '0.08em'
              }}>WALK-IN (ON THE DAY)</div>

              {[
                { n: '1', t: 'Arrive at the outreach venue', d: 'No prior registration needed. Come to the event location on the day and approach the registration desk.' },
                { n: '2', t: 'Staff registers you on-site', d: 'A staff member fills in your details and your pet\'s info. A queue number is assigned immediately.' },
                { n: '3', t: 'Proceed through the same process', d: 'Walk-ins follow the same examination, procedure, and billing steps as pre-registered owners.' },
                { n: '4', t: 'Post-op chatbot on discharge', d: 'You receive the same post-op message with a 10-day AI chatbot link when your pet is discharged.' },
              ].map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 18, marginBottom: i < 3 ? 28 : 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#39d353', color: '#1a0a2e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 6 }}>{step.t}</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{step.d}</div>
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 32, padding: '16px 20px',
                background: 'rgba(57,211,83,0.08)',
                border: '1px solid rgba(57,211,83,0.2)',
                borderRadius: 10
              }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Please check your inbox for a pre-registration email detailing the necessary pre-surgery instructions for your pet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENS ON EVENT DAY ── */}
      <section style={{ padding: '96px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#7b2d8b', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              EVENT DAY FLOW
            </p>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#1a0a2e', marginBottom: 16 }}>
              What happens when you arrive
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Every participant follows the same four steps on event day regardless of how they registered.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              {
                num: '01',
                title: 'Check-In & Queue',
                desc: 'QR scan or walk-in registration. Queue number assigned on arrival — first come, first served.'
              },
              {
                num: '02',
                title: 'Physical Examination',
                desc: 'Vet checks each pet individually. Weight recorded, fitness assessed. Accepted or rejected per pet.'
              },
              {
                num: '03',
                title: 'Procedure & Billing',
                desc: 'Spay or neuter performed. Medication dispensed. Payment recorded. Digital receipt sent.'
              },
              {
                num: '04',
                title: 'Discharge & Recovery',
                desc: 'Pet released. Post-op message sent immediately. AI chatbot link activated for 10 days.'
              },
            ].map((item, i) => (
              <div key={item.num} style={{
                background: '#fafafa', borderRadius: 14,
                padding: '32px 24px', border: '1px solid #f0eaf5',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  fontSize: 64, fontWeight: 800,
                  color: '#f0eaf5', lineHeight: 1, marginBottom: 16,
                  position: 'absolute', top: 12, right: 20
                }}>{item.num}</div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#7b2d8b', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, marginBottom: 20, position: 'relative', zIndex: 1
                }}>{i + 1}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a0a2e', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, margin: 0, position: 'relative', zIndex: 1 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <p style={{ color: '#7b2d8b', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
                WHAT WE OFFER
              </p>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: '#1a0a2e', marginBottom: 16, lineHeight: 1.2 }}>
                A Seamless Journey for You and Your Pet
              </h2>
              <p style={{ color: '#666', fontSize: 16, lineHeight: 1.75, marginBottom: 40 }}>
              From the moment you register until your pet is fully recovered 10 days after surgery, 
              we are with you every step of the way with continuous support and guided care.   
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { 
    t: 'One-Scan Check-In', 
    d: 'Check in all your pets at once with a single QR code. Get your queue number instantly and skip the paperwork on arrival.' 
  },
  { 
    t: 'Personalized Care Guides', d: 'Receive custom fasting and prep instructions for your pet’s specific age and species, sent straight to your phone the day before.' 
  },
  { 
    t: '24/7 Recovery Support', d: 'Our AI assistant stays with you for 10 days after surgery, ready to answer questions based on your pet’s specific procedure and meds.' 
  },
  { 
    t: 'Instant Digital Records', d: 'No more lost papers. Your billing details, treatment records, and receipts are automatically sent via email or SMS for easy access.' 
  },
  { 
    t: 'Your Pets Health History', d: 'Save time on future visits by securely storing your details. Easily claim and track records from any past or future clinic event.' 
  },
                ].map(f => (
                  <div key={f.t} style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#39d353', marginTop: 6, flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a0a2e', marginBottom: 4 }}>{f.t}</div>
                      <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          <div style={{
          borderRadius: 20, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          aspectRatio: '4/3', 
          position: 'relative',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          flexDirection: 'column', 
          gap: 10
        }}>
          <Image src="/images/care.jpg" alt="Pet Care" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section style={{ padding: '96px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#7b2d8b', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              SCHEDULE
            </p>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#1a0a2e', marginBottom: 12 }}>
              Upcoming outreach events
            </h2>
            <p style={{ color: '#999', fontSize: 15 }}>
              Walk-ins welcome at all events. Pre-register to receive your QR code and preparation instructions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { date: 'Jan 15', day: 'Wednesday', loc: 'Barangay 187, Caloocan', slots: 60, open: false },
              { date: 'Jan 22', day: 'Wednesday', loc: 'Barangay 178, Caloocan', slots: 60, open: true },
              { date: 'Jan 29', day: 'Wednesday', loc: 'Barangay 170, Caloocan', slots: 60, open: true },
            ].map(ev => (
              <div key={ev.date} style={{
                background: '#fafafa', borderRadius: 12,
                padding: '20px 28px', display: 'flex',
                alignItems: 'center', gap: 24,
                border: '1px solid #ede8f3',
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  background: '#f5edf8', borderRadius: 10,
                  padding: '10px 18px', textAlign: 'center', minWidth: 72, flexShrink: 0
                }}>
                  <div style={{ fontSize: 10, color: '#7b2d8b', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {ev.date.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#7b2d8b', lineHeight: 1.1 }}>
                    {ev.date.split(' ')[1]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a0a2e', marginBottom: 4 }}>{ev.loc}</div>
                  <div style={{ fontSize: 13, color: '#999' }}>
                    {ev.day} · {ev.slots} slots · Walk-ins welcome
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    background: ev.open ? 'rgba(57,211,83,0.12)' : '#f3f4f6',
                    color: ev.open ? '#16a34a' : '#999',
                    padding: '5px 14px', borderRadius: 99,
                    fontSize: 12, fontWeight: 700
                  }}>{ev.open ? 'Open' : 'Coming Soon'}</span>
                  {ev.open && (
                    <Link href="/register" style={{
                      background: '#7b2d8b', color: 'white',
                      padding: '9px 22px', borderRadius: 8,
                      textDecoration: 'none', fontSize: 13, fontWeight: 700,
                      transition: 'background 0.15s', cursor: 'pointer'
                    }}>Pre-Register</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        margin: '0 40px 80px', borderRadius: 20,
        background: 'linear-gradient(135deg, #2d1050 0%, #7b2d8b 100%)',
        padding: '72px 64px',
        display: 'grid', gridTemplateColumns: '1fr auto',
        alignItems: 'center', gap: 40
      }}>
        <div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Ready to bring your pet?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.75, maxWidth: 480 }}>
            Pre-register online to get your QR code and personalized pre-op instructions —
            or just show up on the day. Either way, your pet is welcome.
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
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>
                QUICK LINKS
              </div>
              {[['Home', '/'], ['Register', '/register'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 14,
                    textDecoration: 'none', transition: 'color 0.15s'
                  }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>
                RESOURCES
              </div>
              {[['Privacy Policy', '/about'], ['Terms of Use', '/about'], ['FAQ', '/contact']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <Link href={href} style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 14,
                    textDecoration: 'none', transition: 'color 0.15s'
                  }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 20, letterSpacing: '0.06em' }}>
                CONTACT
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 2 }}>
                <div>0927 867 8760</div>
                <div style={{ marginTop: 8, color: '#39d353' }}>northernhillsvet@gmail.com</div>
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