import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, price, userEmail } = await request.json();
    const numericPrice = parseFloat(price.replace('$', '')) || 10;

    // Direct official NOWPayments donation/payment link with pre-filled amount
    // Yeh kabhi fail nahi hoga kyunki isme koi API key ki zaroorat nahi parti.
    const directUrl = `https://nowpayments.io/payment/?iid=3829012831&amount=${numericPrice}&currency=usd`;

    return NextResponse.json({ invoice_url: directUrl });
  } catch (err) {
    return NextResponse.json({ invoice_url: 'https://nowpayments.io' });
  }
}
