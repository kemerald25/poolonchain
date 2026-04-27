import { NextResponse } from 'next/server';
import { getXummClient } from '@/lib/xumm/client';

export async function POST() {
  try {
    const xumm = getXummClient();
    
    if (!xumm) {
       return NextResponse.json({ error: "Xaman credentials missing" }, { status: 500 });
    }

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'SignIn',
      }
    });

    if (!payload?.uuid) {
        throw new Error("Failed to create Xaman Sign-In payload.");
    }

    return NextResponse.json({
       uuid: payload.uuid,
       next: payload.next.always
    });
  } catch (error) {
    console.error("Xaman Sign-In Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
