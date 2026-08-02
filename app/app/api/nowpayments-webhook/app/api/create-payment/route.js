import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialize kar rahay hain
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();
    const numericPrice = parseFloat(price.replace('$', '')) || 10;

    // 1. Database (Supases) mein user ki email aur purchase details save kar rahay hain
    const { error: dbError } = await supabase
      .from('purchases')
      .insert([
        { user_email: userEmail, title: title, price: price }
      ]);

    if (dbError) {
      console.error('Supabase Error:', dbError.message);
    }

    // 2. Direct NOWPayments link jahan user payment karega
    const directUrl = `https://nowpayments.io/payment/?iid=3829012831&amount=${numericPrice}&currency=usd`;

    return NextResponse.json({ invoice_url: directUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ invoice_url: 'https://nowpayments.io' });
  }
}
