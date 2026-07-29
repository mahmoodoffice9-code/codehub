import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();

    const numericPrice = parseFloat(price.replace('$', '')) || 10;
    const apiKey = 'E45S8MH-KQEM55M-GMSZ6VN-K5WV1MD'; 

    // NOWPayments standard payment request payload
    const payload = {
      price_amount: numericPrice,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: 'ORDER_' + Date.now(),
      order_description: `Item: ${title} | User: ${userEmail}`,
      ipn_callback_url: 'https://codehub-ai-marketplace.vercel.app/api/nowpayments-webhook',
      success_url: 'https://codehub-ai-marketplace.vercel.app',
      cancel_url: 'https://codehub-ai-marketplace.vercel.app',
    };

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("NOWPayments API Full Response:", data);

    if (!response.ok || !data.payment_id) {
      throw new Error(data.message || 'Payment creation failed from gateway.');
    }

    // Direct payment tracking URL generate karna
    const checkoutUrl = `https://nowpayments.io/payment/?iid=${data.payment_id}`;

    return NextResponse.json({ invoice_url: checkoutUrl });
  } catch (err) {
    console.error('Payment API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
