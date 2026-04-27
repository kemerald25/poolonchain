import { NextResponse } from 'next/server';
import { getXummClient } from '@/lib/xumm/client';
import { env } from '@/lib/env';
import { z } from 'zod';

const requestSchema = z.object({
  amountXrp: z.number().positive(),
  matchId: z.string().uuid().or(z.string()), // Accept any string for mock dev ease
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountXrp, matchId } = requestSchema.parse(body);

    const xumm = getXummClient();
    
    if (!xumm) {
       // Dev mock response
       return NextResponse.json({ 
           uuid: 'mock-uuid-1234', 
           next: { always: 'https://xumm.app/mock-url' }
       });
    }

    if (!env.TREASURY_WALLET_ADDRESS) {
       throw new Error("Missing TREASURY_WALLET_ADDRESS");
    }

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'Payment',
        Destination: env.TREASURY_WALLET_ADDRESS,
        Amount: (amountXrp * 1000000).toString(), // Convert XRP to drops
        Memos: [
            {
               Memo: {
                  // Memo matching the match connection
                  MemoData: Buffer.from(`wager_${matchId}`).toString('hex'),
               }
            }
        ]
      }
    });

    if (!payload?.uuid) {
        throw new Error("Failed to create Xaman payload...");
    }

    // Return the generated UUID and browser navigation URL
    return NextResponse.json({
       uuid: payload.uuid,
       next: payload.next
    });
  } catch (error) {
    console.error("Xaman Payload Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
