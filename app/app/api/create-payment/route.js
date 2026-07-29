import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();

    // Price se '$' sign hata kar number bana rahe hain
    const numericPrice = parseFloat(price.replace('$', '')) || 10;

    // NOWPayments API Request Payload
    const paymentData = {
      price_amount: numericPrice,
      price_currency: 'usd', // USD mein price bhej rahe hain
      pay_currency: 'usdt',  // User USDT mein pay karega
      order_id: 'ORDER_' + Date.now(),
      order_description: `Purchase of ${title} by ${userEmail || 'Guest'}`,
      ipn_callback_url: 'https://yourdomain.com/api/nowpayments-webhook', // Ye baad mein set karenge
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel'
    };

    // NOWPayments API Call (Sandbox ya Live API Key yahan lagegi)
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YAHAN_APNI_NOWPAYMENTS_API_KEY_DAL' // Apni real API key yahan daalni hai
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create NOWPayments invoice');
    }

    // Yeh invoice ka URL return karega jahan user payment karega
    return NextResponse.json({ invoice_url: data.invoice_url });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
