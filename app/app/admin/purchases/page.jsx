'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialize kar rahay hain
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching purchases:', error.message);
        } else {
          setPurchases(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: 'white', padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Admin Dashboard 🛡️</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Yahan aap saari user purchases aur emails dekh saktay hain jo payment ke liye aayi hain.</p>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', color: '#94a3b8' }}>
            Abhi tak koi purchase record nahi mila!
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#0b0f19', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '16px' }}>User Email</th>
                  <th style={{ padding: '16px' }}>Asset Title</th>
                  <th style={{ padding: '16px' }}>Price</th>
                  <th style={{ padding: '16px' }}>Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#38bdf8' }}>{item.user_email}</td>
                    <td style={{ padding: '16px' }}>{item.title}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#4ade80' }}>{item.price}</td>
                    <td style={{ padding: '16px', color: '#94a3b8', fontSize: '12px' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
