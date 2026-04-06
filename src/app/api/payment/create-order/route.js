import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin strictly for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // fallback to anon if service missing temporarily
);

export async function POST(req) {
  try {
    const { amount, currency = "INR", receipt, entry_no } = await req.json();

    if (!amount || !entry_no) {
      return NextResponse.json({ error: "Missing required parameters (amount, entry_no)" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials not configured." }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${entry_no}_${Math.random().toString(36).substring(7)}`,
      notes: {
        entry_no: entry_no
      }
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Failed to create Razorpay order." }, { status: 500 });
    }

    // Optionally: Store pending order in DB here if you want to track drops
    
    return NextResponse.json({ order, success: true });
    
  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Order creation failed. Check server logs." }, { status: 500 });
  }
}
