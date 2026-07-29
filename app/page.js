'use client'
import { useState } from 'react'

export default function Home() {
  const [assets, setAssets] = useState([
    { id: 1, title: 'Advanced n8n Lead Gen Workflow', category: 'n8n', price: '$15' },
    { id: 2, title: 'Make.com CRM Automation Scenario', category: 'Make.com', price: '$20' },
    { id: 3, title: 'Python Web Scraping Bot', category: 'Python Bot', price: '$25' },
  ])

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>⚡ CodeHub</h1>
        <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Login</button>
      </nav>

      <section style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>Buy & Sell Ready-Made AI Assets</h2>
        <p style={{ color: '#94a3b8' }}>Get high-quality n8n workflows, Make scenarios, and Python bots instantly.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {assets.map((asset) => (
          <div key={asset.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '12px', background: '#334155', padding: '4px 8px', borderRadius: '4px' }}>{asset.category}</span>
            <h3 style={{ margin: '15px 0 10px 0' }}>{asset.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>{asset.price}</span>
              <button style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
