import { NextResponse } from 'next/server';
import { getXummClient } from '@/lib/xumm/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json({ error: "Missing payload UUID" }, { status: 400 });
    }

    const xumm = getXummClient();
    if (!xumm) {
       return NextResponse.json({ error: "Xaman credentials missing" }, { status: 500 });
    }

    const payload = await xumm.payload.get(uuid);

    if (!payload) {
      return NextResponse.json({ error: "Payload not found" }, { status: 404 });
    }

    // Check if the payload has been resolved (signed or rejected)
    const status = {
      signed: payload.meta.signed,
      cancelled: payload.meta.cancelled,
      expired: payload.meta.expired,
      address: payload.response?.account || null,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Xaman Status Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
