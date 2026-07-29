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

    // Listen for auth state changes
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
        alert('Check your email for confirmation link, or log in if email confirmation is disabled! ✉️')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        alert('Logged in successfully! 🎉')
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

      alert('Asset uploaded successfully! 🎉')
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
    <main style={{ padding: '40px 20px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>⚡ CodeHub</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <>
              <button 
                onClick={() => setShowUploadForm(!showUploadForm)} 
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {showUploadForm ? '❌ Close Form' : '➕ Upload Asset'}
              </button>
              <button 
                onClick={handleLogout} 
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)} 
              style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Login / Register 🔑
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>AI Asset Marketplace</h2>
        <p style={{ color: '#94a3b8' }}>Discover high-quality n8n workflows, Make scenarios, and Python bots instantly.</p>
      </section>

      {/* Auth Modal */}
      {showAuthModal && !user && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', maxWidth: '400px', margin: '0 auto 40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: '#38bdf8' }}>{isSignUp ? '📝 Register New Account' : '🔐 Login to CodeHub'}</h3>
            <button onClick={() => setShowAuthModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                required 
              />
            </div>
            <button 
              type="submit" 
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
            >
              {isSignUp ? 'Sign Up 🚀' : 'Login 🚀'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span 
                onClick={() => setIsSignUp(!isSignUp)} 
                style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isSignUp ? 'Login here' : 'Sign up'}
              </span>
            </p>
          </form>
        </div>
      )}

      {/* Asset Upload Form (Only visible if logged in and button clicked) */}
      {showUploadForm && user && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#38bdf8' }}>📤 Upload Your AI Asset</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Asset Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Advanced Lead Scraper Bot" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                >
                  <option value="n8n">n8n Workflow</option>
                  <option value="Make">Make Scenario</option>
                  <option value="Python Bot">Python Bot</option>
                  <option value="Prompt Template">Prompt Template</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Price (USD)</label>
                <input 
                  type="text" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g., 25" 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Briefly describe what this asset does..." 
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#cbd5e1' }}>Asset Link / Download Link</label>
              <input 
                type="text" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                placeholder="https://drive.google.com/... or GitHub link" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #475569', color: 'white' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ background: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
            >
              {submitting ? 'Publishing...' : 'Publish to Marketplace 🚀'}
            </button>
          </form>
        </div>
      )}

      {/* Marketplace Assets Listing */}
      <h3 style={{ marginBottom: '20px', fontSize: '22px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🛍️ Live Marketplace</h3>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading marketplace assets... ⏳</p>
      ) : assets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No assets found in marketplace. Login and upload your first asset! 😊</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {assets.map((asset, index) => (
            <div key={index} style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', background: '#334155', padding: '4px 8px', borderRadius: '4px', color: '#38bdf8' }}>{asset.category}</span>
                <h4 style={{ margin: '15px 0 10px 0', fontSize: '18px' }}>{asset.title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '15px' }}>{asset.description || 'No description provided.'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>{asset.price}</span>
                <a 
                  href={asset.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ background: '#22c55e', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}
                >
                  Buy Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
