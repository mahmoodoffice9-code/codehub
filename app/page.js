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
  const [activeTab, setActiveTab] = useState('Marketplace')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('n8n Workflow')
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

  async function handleUpload(e) {
    e.preventDefault()
    if (!title || !price || !link) {
      alert('Please fill in all required fields!')
      return
    }

    setSubmitting(true)
    try {
      const formattedPrice = price.startsWith('$') ? price : `$${price}`
      const { error } = await supabase.from('assets').insert([
        { title, category, description, price: formattedPrice, link }
      ])
      if (error) throw error
      alert('Asset published successfully! 🎉')
      setTitle('')
      setDescription('')
      setPrice('')
      setLink('')
      setActiveTab('Marketplace')
      fetchAssets()
    } catch (error) {
      alert('Error uploading asset: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = selectedCategory === 'All' || asset.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <main style={{ padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#070b14', color: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Main Navigation Container */}
      <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px 24px', maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>⚡</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>CodeHub AI</h1>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Marketplace', 'Your Store', 'Buying Details', 'My Assets', '+ Sell Asset', 'Support', 'Admin Panel'].map((tab) => {
            const isActive = activeTab === tab
            const isSell = tab === '+ Sell Asset'
            return (
              <button 
                key={tab}
                onClick={() => {
                  if (tab === '+ Sell Asset') {
                    setActiveTab('Sell Asset')
                  } else {
                    setActiveTab(tab)
                  }
                }}
                style={{ 
                  background: isSell ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : isActive ? '#7c3aed' : '#111827', 
                  color: 'white', 
                  border: isActive || isSell ? 'none' : '1px solid #1f2937', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  fontSize: '13px',
                  boxShadow: isSell ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* User Profile / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <button 
              onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Logout ({user.email.split('@')[0]})
            </button>
          ) : (
            <button 
              onClick={() => {
                const email = prompt('Enter email to sign in/register:')
                const password = prompt('Enter password:')
                if (email && password) {
                  supabase.auth.signInWithPassword({ email, password }).then(({error, data}) => {
                    if (error) {
                      supabase.auth.signUp({ email, password }).then(({error: err}) => {
                        if (err) alert(err.message)
                        else { alert('Account created & logged in!'); checkUser(); }
                      })
                    } else { alert('Logged in successfully!'); checkUser(); }
                  })
                }
              }}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Login / Sign Up 🔑
            </button>
          )}
        </div>
      </div>

      {/* Conditional View: Sell Asset Form */}
      {activeTab === 'Sell Asset' ? (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#38bdf8' }}>📤 Upload & Sell New Asset</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Asset Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Advanced AI Scraper" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }}>
                  <option value="n8n Workflow">n8n Workflow</option>
                  <option value="Make.com Flow">Make.com Flow</option>
                  <option value="AI Agent">AI Agent</option>
                  <option value="Micro-SaaS">Micro-SaaS</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Price (e.g., $15)</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this workflow do..." rows="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Download / Access Link</label>
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>{submitting ? 'Publishing...' : 'Publish Asset 🚀'}</button>
              <button type="button" onClick={() => setActiveTab('Marketplace')} style={{ background: '#334155', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : activeTab !== 'Marketplace' ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
          <h2>🚧 {activeTab} Section</h2>
          <p>This section is ready for your custom data integration!</p>
          <button onClick={() => setActiveTab('Marketplace')} style={{ marginTop: '20px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Marketplace</button>
        </div>
      ) : (
        <>
          {/* Network Badge */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ background: '#111827', border: '1px solid #1f2937', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
              ⚡ Instant Crypto Checkout • Verified BEP-20 Network
            </span>
          </div>

          {/* Hero Section */}
          <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>
              Premium <span style={{ background: 'linear-gradient(to right, #38bdf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Workflows & Codebase</span>
            </h2>
            
            {/* Search Bar */}
            <div style={{ maxWidth: '600px', margin: '0 auto 20px auto', position: 'relative' }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search workflows, scrapers, agents..." 
                style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', background: '#0c1322', border: '1px solid #1e293b', color: 'white', fontSize: '15px', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {['All', 'n8n Workflow', 'Make.com Flow', 'AI Agent', 'Micro-SaaS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? '#7c3aed' : '#0c1322',
                    color: selectedCategory === cat ? 'white' : '#94a3b8',
                    border: '1px solid #1e293b',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Marketplace Grid (Exactly 3 per row) */}
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading assets... ⏳</p>
            ch) : filteredAssets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No assets found. Click "+ Sell Asset" above to add your first creation! 😊</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {filteredAssets.map((asset, index) => (
                  <div key={index} style={{ background: '#0c1322', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.4)', transition: 'transform 0.2s' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: '#172033', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                          ⚡ {asset.category}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{asset.price}</span>
                      </div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>{asset.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{asset.description || 'No description provided.'}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                      <button 
                        onClick={() => alert(`Details: \n\n${asset.title}\n\n${asset.description || 'No description'}\n\nPrice: ${asset.price}`)}
                        style={{ background: '#172033', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        👁️ View Details
                      </button>
                      <a 
                        href={asset.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                      >
                        Buy ({asset.price})
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  )
}
