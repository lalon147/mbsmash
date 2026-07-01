'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Lock } from 'lucide-react';

const T = {
  bg:      '#090612',
  panel:   '#20153c',
  line:    '#4d3291',
  text:    '#e8edf7',
  dim:     '#9b8ec4',
  accent:  '#794ee6',
  mid:     '#6340bc',
  danger:  '#f472b6',
};

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Incorrect password. Try again.');
      setPassword('');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 360,
        background: T.panel, borderRadius: 16,
        border: `1px solid ${T.line}`, padding: '40px 32px',
        boxShadow: '0 0 80px rgba(121,78,230,.18)',
      }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 68, height: 68, borderRadius: '50%',
            background: 'rgba(121,78,230,.12)', border: `2px solid ${T.accent}`,
            marginBottom: 18,
            boxShadow: '0 0 24px rgba(121,78,230,.25)',
          }}>
            <Wrench size={30} color={T.accent} />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: 0.3 }}>
            MB Smash Repair
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: T.dim }}>Parts Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{
              display: 'block', fontSize: 11.5, fontWeight: 700, color: T.dim,
              marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color={T.dim} style={{
                position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter shop password"
                autoFocus
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 38px', boxSizing: 'border-box',
                  background: T.bg, border: `1px solid ${error ? T.danger : T.line}`,
                  borderRadius: 10, color: T.text, fontSize: 15, outline: 'none',
                  fontFamily: 'inherit', transition: 'border-color .15s',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = T.accent; }}
                onBlur={e =>  { if (!error) e.target.style.borderColor = T.line; }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: T.danger, textAlign: 'center',
              padding: '9px 14px', background: 'rgba(244,114,182,.08)',
              borderRadius: 8, border: `1px solid rgba(244,114,182,.2)`,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '13px', background: loading ? T.mid : T.accent,
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background .15s',
              letterSpacing: 0.2,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
