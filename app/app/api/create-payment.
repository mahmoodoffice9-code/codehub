import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { price, itemName, itemSku } = await request.json();

    if (!price || !itemName) {
      return NextResponse.json({ error: 'Price and item name are required' }, { status: 400 });
    }

    // Call NOWPayments Invoice API
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: parseFloat(price),
        price_currency: 'usd',
        order_id: itemSku || 'ORDER_' + Date.now(),
        order_description: `Purchase of ${itemName}`,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Payment generation failed' }, { status: response.status });
    }

    return NextResponse.json({ invoice_url: data.invoice_url });

  } catch (error) {
    console.error('NOWPayments Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
