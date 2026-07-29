import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();

    const numericPrice = parseFloat(price.replace('$', '')) || 10;
    const apiKey = 'E45S8MH-KQEM55M-GMSZ6VN-K5WV1MD'; 

    const payload = {
      price_amount: numericPrice,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: 'ORDER_' + Date.now(),
      order_description: `Purchase of ${title}`,
      ipn_callback_url: 'https://turadomain.com/api/nowpayments-webhook',
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
    
    // Yahan hum exact NOWPayments ka response print kar rahe hain
    console.log("NOWPayments Response:", data);

    if (!response.ok) {
      return NextResponse.json({ error: data.message || JSON.stringify(data) }, { status: 400 });
    }

    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error('Payment API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
