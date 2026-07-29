'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qekcqdbakwjhixmtovxg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla2NxZGJha3dqaGl4bXRvdnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzIxNjIsImV4cCI6MjEwMDkwODE2Mn0.h_A9NHj79ROnuA5Dw_7DFs9lPxTnp0KBkEI90Pi3Mdo'
)

export default function Home() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  // Modals state
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Auth inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Asset upload inputs
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('n8n')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkUser()
    fetchAssets()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  async function fetchAssets() {
    try {
      const { data, error } = await supabase.from('assets').select('*')
      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAuth(e) {
    e.preventDefault()
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Account created successfully! You are now logged in. 🎉')
        setShowAuthModal(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        alert('Logged in successfully! 🚀')
        setShowAuthModal(false)
      }
    } catch (error) {
      alert('Auth Error: ' + error.message)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    alert('Logged out successfully!')
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!title || !price || !link) {
      alert('Please fill in all required fields!')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('assets').insert([
        { title, category, description, price: `$${price}`, link }
      ])

      if (error) throw error

      alert('Asset published to marketplace successfully! 🎉')
      setTitle('')
      setDescription('')
      setPrice('')
      setLink('')
      setShowUploadForm(false)
      fetchAssets()
    } catch (error) {
      alert('Error uploading asset: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: '40px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Modern Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>⚡</span>
          <h1 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>CodeHub</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <button 
                onClick={() => setShowUploadForm(!showUploadForm)} 
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'background 0.2s' }}
              >
                {showUploadForm ? '✕ Close Form' : '+ Upload Asset'}
              </button>
              <button 
                onClick={handleLogout} 
                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)} 
              style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)' }}
            >
              Sign In / Register 🔑
            </button>
          )}
        </div>
      </nav>

      {/* Hero Header */}
      <section style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Ready-Made AI & Automation Assets</h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Scale your workflow instantly with production-grade n8n templates, Make scenarios, and Python bots.</p>
      </section>

      {/* Auth Modal Overlay */}
      {showAuthModal && !user && (
        <div style={{ background: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid #334155', maxWidth: '420px', margin: '0 auto 50px auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h3>
            <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@domain.com" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                required 
              />
            </div>
            <button 
              type="submit" 
              style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
            >
              {isSignUp ? 'Create Account 🚀' : 'Sign In 🚀'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span 
                onClick={() => setIsSignUp(!isSignUp)} 
                style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}
              >
                {isSignUp ? 'Sign In' : 'Sign up'}
              </span>
            </p>
          </form>
        </div>
      )}

      {/* Upload Form Box */}
      {showUploadForm && user && (
        <div style={{ background: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid #1e293b', marginBottom: '50px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '700', color: '#38bdf8' }}>📤 Publish New Asset</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Asset Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Advanced Lead Scraper Bot" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                  <option value="n8n">n8n Workflow</option>
                  <option value="Make">Make Scenario</option>
                  <option value="Python Bot">Python Bot</option>
                  <option value="Prompt Template">Prompt Template</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Price (USD)</label>
                <input 
                  type="text" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g., 29" 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What does this asset do and what are its features?" 
                rows="3"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Download / Access Link</label>
              <input 
                type="text" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                placeholder="https://github.com/... or Google Drive link" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#090d16', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            >
              {submitting ? 'Publishing...' : 'Publish to Marketplace 🚀'}
            </button>
          </form>
        </div>
      )}

      {/* Marketplace Grid Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>🛍️ Explore Marketplace</h3>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{assets.length} items available</span>
      </div>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Loading catalog... ⏳</p>
      ) : assets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No assets found in marketplace. Sign in and publish the first one! 😊</p>
      ) : (
        /* Exactly 3 Cards per row grid layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {assets.map((asset, index) => (
            <div key={index} style={{ background: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, border-color 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', background: '#1e293b', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{asset.category}</span>
                </div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: '#f8fafc', lineHeight: '1.4' }}>{asset.title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{asset.description || 'No description provided.'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>{asset.price}</span>
                <a 
                  href={asset.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ background: '#10b981', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                >
                  Buy Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
