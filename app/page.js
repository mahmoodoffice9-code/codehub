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
  const [showForm, setShowForm] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('n8n')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [])

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

  async function handleSubmit(e) {
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
      setShowForm(false) // Form band ho jaye ga upload ke baad
      fetchAssets() // List refresh ho gi
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
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{ background: showForm ? '#ef4444' : '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? '❌ Close Form' : '➕ Upload Asset'}
        </button>
      </nav>

      {/* Hero Section */}
      {!showForm && (
        <section style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>AI Asset Marketplace</h2>
          <p style={{ color: '#94a3b8' }}>Discover high-quality n8n workflows, Make scenarios, and Python bots instantly.</p>
        </section>
      )}

      {/* Seller Upload Form (Collapsible) */}
      {showForm && (
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#38bdf8' }}>📤 Upload Your AI Asset</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No assets found in marketplace. Click "Upload Asset" above to add your first workflow or bot! 😊</p>
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
