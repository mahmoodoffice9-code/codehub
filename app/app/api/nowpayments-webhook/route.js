import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qekcqdbakwjhixmtovxg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla2NxZGJha3dqaGl4bXRvdnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzIxNjIsImV4cCI6MjEwMDkwODE2Mn0.h_A9NHj79ROnuA5Dw_7DFs9lPxTnp0KBkEI90Pi3Mdo'
);

export async function POST(request) {
  try {
    const paymentData = await request.json();

    // NOWPayments status check karega ke payment complete hui ya nahi ('finished' ya 'confirmed')
    if (paymentData.payment_status === 'finished' || paymentData.payment_status === 'confirmed') {
      const orderId = paymentData.order_id;
      const userEmail = paymentData.order_description;
      const pricePaid = `${paymentData.price_amount} ${paymentData.pay_currency.toUpperCase()}`;

      // Supabase ke 'purchases' table mein order save kar rahe hain
      const { error } = await supabase.from('purchases').insert([
        {
          title: orderId,
          category: 'Crypto Payment',
          price: pricePaid,
          link: '#', // Yahan item ka secure download link bhi de sakte ho
          purchased_at: new Date().toLocaleString()
        }
      ]);

      if (error) {
        console.error('Database insert error:', error.message);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
