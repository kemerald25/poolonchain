import { NextResponse } from 'next/server';
import { getXrplClient } from '@/lib/xrpl/client';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const { txHash } = await req.json();

    if (!txHash) {
       return NextResponse.json({ error: "Missing txHash" }, { status: 400 });
    }

    if (!env.TREASURY_WALLET_ADDRESS) {
       return NextResponse.json({ verified: true, mock: true }); // Mock mode
    }

    const client = await getXrplClient();
    
    // Look up the transaction on the XRPL ledger
    const tx = await client.request({
      command: 'tx',
      transaction: txHash,
    });

    // Verify it is a successful Payment to our treasury wallet
    const meta = tx.result.meta;
    if (
       tx.result.TransactionType !== 'Payment' ||
       tx.result.Destination !== env.TREASURY_WALLET_ADDRESS ||
       !meta ||
       typeof meta === 'string' ||
       meta.TransactionResult !== 'tesSUCCESS'
    ) {
        return NextResponse.json({ verified: false, reason: "Transaction invalid or failed" });
    }

    // Capture delivered amount if available (XRP is usually in meta.delivered_amount)
    const deliveredAmount = (meta as { delivered_amount?: string | number | object }).delivered_amount;

    return NextResponse.json({ verified: true, deliveredAmount });
  } catch (error) {
    console.error("XRPL Verify Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
