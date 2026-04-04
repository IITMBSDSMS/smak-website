import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { courseId, userId, amount } = body;

    if (!courseId || !userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Initialize Razorpay / Stripe instance here.
    // Assuming Razorpay for this stub:
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const options = { amount: amount * 100, currency: "INR", receipt: `receipt_${courseId}_${userId}` };
    // const order = await razorpay.orders.create(options);

    // MOCK ORDER CREATION FOR NOW
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${courseId}_${userId}`
    };

    return NextResponse.json({ 
      success: true, 
      order: mockOrder,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
