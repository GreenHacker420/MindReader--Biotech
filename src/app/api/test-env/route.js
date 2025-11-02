import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? '***' + process.env.STRIPE_SECRET_KEY.slice(-4) : 'Not set',
    nodeEnv: process.env.NODE_ENV,
  });
}
