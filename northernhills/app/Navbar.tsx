'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#1a0a2e', padding: '0 40px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 68,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Logo - EXACT from your code */}
      <Link href="/" style={{ 
        display: 'flex', alignItems: 'center', gap: 10, 
        textDecoration: 'none', cursor: 'pointer', transition: 'all 0.15s' 
      }}>
        <Image src="/FUR.png" alt="Northern Hills" width={44} height={44} />
        <div>
          <div style={{ 
            color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.1 
          }}>
            Northern Hills
          </div>
          <div style={{ 
            color: '#39d353', fontSize: 10, letterSpacing: '0.12em', fontWeight: 600 
          }}>
            VETERINARY CLINIC
          </div>
        </div>
      </Link>

      {/* Links + Buttons - EXACT from your code */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 32, fontSize: 14 
      }}>
        {[['Home', '/'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
          <Link 
            key={label} 
            href={href} 
            style={{
              color: label === 'Home' ? 'white' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none', 
              fontWeight: label === 'Home' ? 700 : 500,
              transition: 'color 0.15s',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            {label}
          </Link>
        ))}
        
        {/* Sign In */}
        <Link href="/login" style={{
          background: 'transparent', 
          color: 'rgba(255,255,255,0.75)',
          padding: '9px 22px', 
          borderRadius: 8, 
          border: '1px solid rgba(255,255,255,0.2)',
          textDecoration: 'none', 
          fontWeight: 500, 
          fontSize: 14, 
          transition: 'all 0.15s',
          cursor: 'pointer'
        }}>
          Sign In
        </Link>
        
        {/* Register Now */}
        <Link href="/register" style={{
          background: '#7b2d8b', 
          color: 'white',
          padding: '9px 22px', 
          borderRadius: 8,
          textDecoration: 'none', 
          fontWeight: 600, 
          fontSize: 14,
          transition: 'background 0.15s',
          cursor: 'pointer'
        }}>
          Register Now
        </Link>
      </div>
    </nav>
  );
}