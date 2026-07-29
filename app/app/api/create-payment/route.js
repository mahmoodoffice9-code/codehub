import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();
    const numericPrice = parseFloat(price.replace('$', '')) || 10;

    // Direct pre-filled payment URL jo kabhi fail nahi hoga
    const checkoutUrl = `https://nowpayments.io/payment/?iid=3829012831&amount=${numericPrice}&currency=usd`;

    return NextResponse.json({ invoice_url: checkoutUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
