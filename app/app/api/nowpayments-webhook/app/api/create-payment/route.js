import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();

    const numericPrice = parseFloat(price.replace('$', '')) || 10;

    // Direct API key configured here
    const apiKey = 'E45S8MH-KQEM55M-GMSZ6VN-K5WV1MD'; 

    const payload = {
      price_amount: numericPrice,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: title,
      order_description: userEmail,
      ipn_callback_url: 'https://turadomain.com/api/nowpayments-webhook', // Apni live domain yahan bhi update kar lena
    };

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create NOWPayments invoice');
    }

    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error('Payment API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
