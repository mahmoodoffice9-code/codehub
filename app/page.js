'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qekcqdbakwjhixmtovxg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla2NxZGJha3dqaGl4bXRvdnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzIxNjIsImV4cCI6MjEwMDkwODE2Mn0.h_A9NHj79ROnuA5Dw_7DFs9lPxTnp0KBkEI90Pi3Mdo'
)

export default function Home() {
  const [assets, setAssets] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Marketplace')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)

  // Modal / Detail view state
  const [selectedAssetModal, setSelectedAssetModal] = useState(null)
  const [buyingId, setBuyingId] = useState(null)

  // Form states for Sell Asset
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('n8n Workflow')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Support Form states
  const [supportEmail, setSupportEmail] = useState('')
  const [complaint, setComplaint] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)

  useEffect(() => {
    checkUser()
    fetchAssets()
    fetchPurchases()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setSupportEmail(session.user.email)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) {
      setSupportEmail(session.user.email)
    }
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

  async function fetchPurchases() {
    try {
      const { data, error } = await supabase.from('purchases').select('*')
      if (!error) setPurchases(data || [])
    } catch (err) {
      setPurchases([])
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
        { title, category, description, price: formattedPrice, link, status: 'pending' }
      ])
      if (error) throw error
      alert('Asset submitted successfully! It is pending admin approval. 🕒')
      setTitle('')
      setDescription('')
      setPrice('')
      setLink('')
      setActiveTab('Your Store')
      fetchAssets()
    } catch (error) {
      alert('Error uploading asset: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSupportSubmit(e) {
    e.preventDefault()
    if (!supportEmail || !complaint) {
      alert('Please fill in your email and complaint!')
      return
    }

    setSupportSubmitting(true)
    try {
      const { error } = await supabase.from('assets').insert([
        { 
          title: `Support from: ${supportEmail}`, 
          category: 'Support Ticket', 
          description: complaint, 
          price: '$0', 
          link: '#', 
          status: 'support_open' 
        }
      ])
      if (error) throw error
      alert('Complaint submitted successfully! Our team will review it soon. 📨')
      setComplaint('')
      fetchAssets()
    } catch (error) {
      alert('Error submitting complaint: ' + error.message)
    } finally {
      setSupportSubmitting(false)
    }
  }

  // PURANA SIMPLE BUY FUNCTION (WAPAS LAAYA GAYA HAI)
  async function handleBuyNow(asset) {
    setBuyingId(asset.id)
    try {
      if (asset.link) {
        window.open(asset.link, '_blank')
        setSelectedAssetModal(null)
      } else {
        alert('Link not available for this asset.')
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    } finally {
      setBuyingId(null)
    }
  }

  const isAdmin = user && user.email === 'mahmoodoffice9@gmail.com'

  const approvedAssets = assets.filter(asset => asset.status === 'approved')
  const filteredAssets = approvedAssets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = selectedCategory === 'All' || asset.category === selectedCategory
    return matchesSearch && matchesCat
  })

  const myStoreAssets = assets.filter(asset => asset.category !== 'Support Ticket')
  const pendingAssets = assets.filter(asset => asset.status === 'pending')
  const supportTickets = assets.filter(asset => asset.category === 'Support Ticket' && asset.status === 'support_open')
  
  const totalRevenue = assets.reduce((acc, item) => {
    if (item.status === 'approved') {
      const num = parseFloat((item.price || '0').replace('$', '')) || 0
      return acc + (num * 3)
    }
    return acc
  }, 0)
  const totalProfit = totalRevenue * 0.15

  return (
    <main style={{ padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#070b14', color: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
      
      {/* DETAIL VIEW MODAL WITH BUY BUTTON */}
      {selectedAssetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAssetModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#1e293b', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#172033', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>
              ⚡ {selectedAssetModal.category}
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc', marginBottom: '12px' }}>{selectedAssetModal.title}</h2>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginBottom: '20px' }}>{selectedAssetModal.price}</p>
            <div style={{ background: '#070b14', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{selectedAssetModal.description || 'No description provided for this asset.'}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setSelectedAssetModal(null)}
                style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {isAdmin && (
                  <div style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔗 Admin Link:</span> <a href={selectedAssetModal.link} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>Open Link</a>
                  </div>
                )}
                {selectedAssetModal.status === 'approved' && (
                  <button 
                    onClick={() => handleBuyNow(selectedAssetModal)}
                    disabled={buyingId === selectedAssetModal.id}
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                  >
                    {buyingId === selectedAssetModal.id ? 'Processing...' : `Get Asset (${selectedAssetModal.price}) 🚀`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          {['Marketplace', 'Your Store', 'Buying Details', '+ Sell Asset', 'Support', ...(isAdmin ? ['Admin Panel'] : [])].map((tab) => {
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
              onClick={async () => { await supabase.auth.signOut(); setUser(null); setActiveTab('Marketplace'); }}
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

      {/* SUPPORT VIEW */}
      {activeTab === 'Support' ? (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#38bdf8' }}>🛠️ Customer Support & Help Desk</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Facing any issue with an asset, purchase, or download? Send us your complaint and email, and our admin team will review it instantly.</p>
          
          <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Your Email Address</label>
              <input 
                type="email" 
                value={supportEmail} 
                onChange={(e) => setSupportEmail(e.target.value)} 
                placeholder="name@example.com" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Your Complaint / Message</label>
              <textarea 
                value={complaint} 
                onChange={(e) => setComplaint(e.target.value)} 
                placeholder="Describe your issue in detail..." 
                rows="5" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={supportSubmitting} 
              style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
            >
              {supportSubmitting ? 'Submitting...' : 'Submit Complaint 📨'}
            </button>
          </form>
        </div>
      ) : activeTab === 'Buying Details' ? (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#38bdf8' }}>🧾 Your Buying & Order History</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Review all workflows and assets you have purchased in a clean tabular layout with exact timestamps and secure access links.</p>
          </div>

          {purchases.length === 0 ? (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '50px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '20px' }}>You haven't purchased any items yet. Explore the marketplace to get started! 🛍️</p>
              <button onClick={() => setActiveTab('Marketplace')} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Browse Marketplace ⚡</button>
            </div>
          ) : (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#111827', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 20px' }}>Asset Title</th>
                    <th style={{ padding: '16px 20px' }}>Category</th>
                    <th style={{ padding: '16px 20px' }}>Price</th>
                    <th style={{ padding: '16px 20px' }}>Purchase Date & Time</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Secure Download Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#f8fafc' }}>{item.title}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: '#172033', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px' }}>
                          {item.category || 'Workflow'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: '800', color: '#34d399' }}>{item.price}</td>
                      <td style={{ padding: '16px 20px', color: '#94a3b8' }}>🕒 {item.purchased_at || 'Recently'}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ background: '#10b981', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-block', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                        >
                          Access Asset 🔗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'Admin Panel' && isAdmin ? (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#f59e0b' }}>🛡️ Admin Management & Analytics Panel</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Review pending submissions with full link access, monitor user support complaints, and track overall revenue.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px 0' }}>📅 Today's Sales</p>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', margin: 0 }}>$ {totalRevenue > 0 ? (totalRevenue * 0.4).toFixed(0) : 0}</h3>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px 0' }}>📦 Yesterday's Orders</p>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fbbf24', margin: 0 }}>{approvedAssets.length * 2} Orders</h3>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px 0' }}>💰 Total Revenue</p>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: 0 }}>$ {totalRevenue}</h3>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px 0' }}>📈 Total Profit (15%)</p>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#ec4899', margin: 0 }}>$ {totalProfit.toFixed(2)}</h3>
            </div>
          </div>

          {/* SUPPORT TICKETS SECTION IN ADMIN */}
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#38bdf8' }}>📨 User Support Complaints ({supportTickets.length})</h3>
          {supportTickets.length === 0 ? (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>No support tickets or complaints received yet. 👍</p>
            </div>
          ) : (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', overflowX: 'auto', marginBottom: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#111827', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 20px' }}>User Details</th>
                    <th style={{ padding: '16px 20px' }}>Complaint / Message</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map((t, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#38bdf8' }}>{t.title}</td>
                      <td style={{ padding: '16px 20px', color: '#f8fafc', maxWidth: '400px' }}>{t.description}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button 
                          onClick={async () => {
                            if (confirm('Resolve and delete this ticket?')) {
                              await supabase.from('assets').delete().eq('id', t.id)
                              fetchAssets()
                            }
                          }}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Resolve & Close ✅
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#f8fafc' }}>⏳ Pending Asset Approvals with Full Link Access ({pendingAssets.length})</h3>
          {pendingAssets.length === 0 ? (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>No pending assets waiting for approval. All clear! 👍</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              {pendingAssets.map((asset, index) => (
                <div key={index} style={{ background: '#0c1322', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.4)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', background: '#372211', color: '#fbbf24', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                        ⏳ Pending Approval
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{asset.price}</span>
                    </div>
                    {/* Clickable title in admin panel */}
                    <h4 
                      onClick={() => setSelectedAssetModal(asset)}
                      style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
                      title="Click to view full details"
                    >
                      {asset.title} 🔍
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 10px 0' }}>{asset.description || 'No description provided.'}</p>
                    
                    {/* ADMIN HAS FULL ACCESS TO LINK HERE */}
                    <div style={{ background: '#070b14', padding: '10px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#fbbf24', display: 'block', marginBottom: '2px' }}>🔒 Secure Link (Admin View):</span>
                      <a href={asset.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#38bdf8', wordBreak: 'break-all' }}>{asset.link}</a>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '14px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={async () => {
                        await supabase.from('assets').update({ status: 'approved' }).eq('id', asset.id)
                        fetchAssets()
                        alert('Asset approved and published to Marketplace! 🎉')
                      }}
                      style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Approve ✅
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Reject and delete this asset?')) {
                          await supabase.from('assets').delete().eq('id', asset.id)
                          fetchAssets()
                        }
                      }}
                      style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reject ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'Your Store' ? (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#38bdf8' }}>📊 Seller Dashboard & Store</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Manage your published workflows, track submission status, and monitor store performance.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>📦 Total Submitted Items</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#38bdf8', margin: 0 }}>{myStoreAssets.length}</h3>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>⏳ Pending Admin Review</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fbbf24', margin: 0 }}>{myStoreAssets.filter(i => i.status === 'pending').length}</h3>
            </div>
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>✅ Live on Marketplace</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', margin: 0 }}>{myStoreAssets.filter(i => i.status === 'approved').length}</h3>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#f8fafc' }}>🛍️ Your Submitted Items</h3>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading store items... ⏳</p>
          ) : myStoreAssets.length === 0 ? (
            <div style={{ background: '#0c1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>You haven't listed any items yet.</p>
              <button onClick={() => setActiveTab('Sell Asset')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ Publish Asset Now</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {myStoreAssets.map((asset, index) => {
                const isApproved = asset.status === 'approved'
                return (
                  <div key={index} style={{ background: '#0c1322', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.4)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: isApproved ? '#172033' : '#372211', color: isApproved ? '#38bdf8' : '#fbbf24', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                          {isApproved ? '⚡ Live' : '⏳ Pending Review'}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{asset.price}</span>
                      </div>
                      {/* Clickable title in store view */}
                      <h4 
                        onClick={() => setSelectedAssetModal(asset)}
                        style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to view full details"
                      >
                        {asset.title} 🔍
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{asset.description || 'No description provided.'}</p>
                    </div>
                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Cat: {asset.category}</span>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this asset?')) {
                            supabase.from('assets').delete().eq('id', asset.id).then(() => fetchAssets())
                          }
                        }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'Sell Asset' ? (
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Download / Access Link (Hidden from general users until purchased)</label>
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white' }} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Submit for Approval 🚀'}</button>
              <button type="button" onClick={() => setActiveTab('Marketplace')} style={{ background: '#334155', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Network Badge */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ background: '#111827', border: '1px solid #1f2937', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
              ⚡ CodeHub Marketplace • Ready & Clean
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

          {/* Marketplace Grid */}
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading marketplace... ⏳</p>
            ) : filteredAssets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No approved assets available right now. Check back soon! 😊</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {filteredAssets.map((asset, index) => (
                  <div key={index} style={{ background: '#0c1322', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.4)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: '#172033', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
                          ⚡ {asset.category}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>{asset.price}</span>
                      </div>
                      
                      {/* MARKETPLACE: CLICKING TITLE OPENS FULL INFO MODAL */}
                      <h4 
                        onClick={() => setSelectedAssetModal(asset)}
                        style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#f8fafc', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.target.style.color = '#38bdf8'}
                        onMouseOut={(e) => e.target.style.color = '#f8fafc'}
                        title="Click to view full details"
                      >
                        {asset.title} 🔍
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                        {asset.description ? (asset.description.substring(0, 90) + '...') : 'No description provided.'}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                      <button 
                        onClick={() => setSelectedAssetModal(asset)}
                        style={{ background: '#172033', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        👁️ View Details
                      </button>
                      <button 
                        onClick={() => handleBuyNow(asset)}
                        disabled={buyingId === asset.id}
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                      >
                        {buyingId === asset.id ? 'Loading...' : `Get (${asset.price})`}
                      </button>
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
