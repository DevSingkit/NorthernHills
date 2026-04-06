'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type SessionInfo = {
  id: string
  status: 'not_started' | 'active' | 'expired'
  expires_at: string
  registration: {
    owner_name: string
    event_name: string
    event_date: string
    pets: { name: string; species: string; procedure: string | null }[]
  }
}

export default function ChatbotPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchSession() }, [token])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function fetchSession() {
    setLoading(true)

    const { data: sessionData } = await supabase
      .from('chatbot_sessions')
      .select(`
        id, status, expires_at,
        registrations (
          owners (full_name),
          events (event_name, event_date),
          registration_pets (
            medical_records (procedure_performed),
            pets (name, species)
          )
        )
      `)
      .eq('session_token', token)
      .single()

    if (!sessionData) { setNotFound(true); setLoading(false); return }

    const reg = (sessionData as any).registrations
    const session: SessionInfo = {
      id: sessionData.id,
      status: sessionData.status,
      expires_at: sessionData.expires_at,
      registration: {
        owner_name: reg?.owners?.full_name || 'Pet Owner',
        event_name: reg?.events?.event_name || '',
        event_date: reg?.events?.event_date || '',
        pets: (reg?.registration_pets || []).map((rp: any) => ({
          name: rp.pets?.name,
          species: rp.pets?.species,
          procedure: rp.medical_records?.[0]?.procedure_performed || null
        }))
      }
    }
    setSession(session)

    // Load chat history
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionData.id)
      .order('created_at', { ascending: true })

    setMessages(msgs || [])

    // If not_started, update to active
    if (sessionData.status === 'not_started') {
      await supabase
        .from('chatbot_sessions')
        .update({ status: 'active' })
        .eq('id', sessionData.id)
      setSession(prev => prev ? { ...prev, status: 'active' } : prev)
    }

    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || !session || session.status === 'expired') return
    const userText = input.trim()
    setInput('')
    setSending(true)

    // Optimistic UI
    const tempId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userText, created_at: new Date().toISOString() }])

    // Save user message
    await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'user',
      content: userText
    })

    // Call API
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        message: userText,
        sessionInfo: session.registration
      })
    })

    const data = await res.json()
    const reply = data.reply || 'Sorry, I could not process that.'

    // Save assistant message
    const { data: savedMsg } = await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'assistant',
      content: reply
    }).select().single()

    setMessages(prev => [...prev, {
      id: savedMsg?.id || crypto.randomUUID(),
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString()
    }])

    setSending(false)
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0a2e', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Loading chat session...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0a2e', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Invalid Link</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>This chatbot link is invalid or has been removed.</div>
      </div>
    </div>
  )

  if (session?.status === 'expired') return (
    <div style={{ minHeight: '100vh', background: '#1a0a2e', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/FUR.png" alt="logo" width={32} height={32} />
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Northern Hills Post-Op Chat</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Session expired</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 0', marginBottom: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>This session expired on {fmt(session.expires_at)}</div>
        </div>
        {messages.map(m => <ChatBubble key={m.id} message={m} fmtTime={fmtTime} />)}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#1a0a2e', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/FUR.png" alt="logo" width={36} height={36} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Northern Hills Post-Op Chat</div>
            <div style={{ color: '#39d353', fontSize: 11, fontWeight: 600 }}>● Active Session</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{session?.registration.event_name}</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Expires {session ? fmt(session.expires_at) : ''}</div>
        </div>
      </div>

      {/* PET CONTEXT PILLS */}
      {session?.registration.pets && session.registration.pets.length > 0 && (
        <div style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {session.registration.pets.map((p, i) => (
            <div key={i} style={{ background: 'rgba(123,45,139,0.3)', border: '1px solid rgba(123,45,139,0.5)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {p.species === 'cat' ? '🐱' : '🐶'} {p.name}{p.procedure ? ` · ${p.procedure}` : ''}
            </div>
          ))}
        </div>
      )}

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🐾</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Hi, {session?.registration.owner_name}!</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
              I'm your post-operative care assistant. Ask me anything about your pet's recovery, medication, or what to watch out for after the procedure.
            </div>
          </div>
        )}
        {messages.map(m => <ChatBubble key={m.id} message={m} fmtTime={fmtTime} />)}
        {sending && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7b2d8b,#39d353)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Image src="/FUR.png" alt="bot" width={20} height={20} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 800, margin: '0 auto' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask about your pet's recovery..."
            rows={1}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14,
              fontFamily: "'Segoe UI', sans-serif", outline: 'none', resize: 'none',
              lineHeight: 1.5
            }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none',
              background: sending || !input.trim() ? 'rgba(123,45,139,0.3)' : '#7b2d8b',
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
          AI responses are for general guidance only. Contact your vet for emergencies.
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}

function ChatBubble({ message, fmtTime }: { message: Message; fmtTime: (d: string) => string }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7b2d8b,#39d353)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Image src="/FUR.png" alt="bot" width={20} height={20} />
        </div>
      )}
      <div style={{ maxWidth: '70%' }}>
        <div style={{
          background: isUser ? '#7b2d8b' : 'rgba(255,255,255,0.08)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px', color: 'white', fontSize: 14, lineHeight: 1.6,
          whiteSpace: 'pre-wrap'
        }}>
          {message.content}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
          {fmtTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}