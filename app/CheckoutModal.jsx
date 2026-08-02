import { useState } from 'react';

export default function CheckoutModal({ asset, onClose }) {
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!buyerEmail) {
      alert('Pehle apni email enter karain!');
      return;
    }

    setLoading(true);
    try {
      // Backend ke create-payment route ko request bhej rahay hain
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: asset.title,
          price: asset.price,
          userEmail: buyerEmail
        })
      });

      const data = await res.json();
      if (data.invoice_url) {
        // User ko NOWPayments gateway par redirect kar rahay hain
        window.location.href = data.invoice_url;
      } else {
        alert('Payment link generate karne mein masla aya!');
      }
    } catch (err) {
      console.error(err);
      alert('Kuch galat ho gaya!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', width: '100%', maxWidth: '400px', color: 'white' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>Checkout: {asset.title}</h3>
      <p style={{ marginBottom: '20px', color: '#94a3b8', fontSize: '14px' }}>Price: {asset.price}</p>

      <form onSubmit={handleCheckout}>
        {/* Step 1: Checkout Email Input Box */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>
            Your Account / Delivery Email *
          </label>
          <input 
            type="email" 
            value={buyerEmail} 
            onChange={(e) => setBuyerEmail(e.target.value)} 
            placeholder="name@example.com" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#070b14', border: '1px solid #334155', color: 'white', fontSize: '14px', outline: 'none' }} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Processing...' : 'Pay with Crypto 🚀'}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', color: '#94a3b8', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
