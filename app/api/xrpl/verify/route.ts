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
    if (
       tx.result.TransactionType !== 'Payment' ||
       tx.result.Destination !== env.TREASURY_WALLET_ADDRESS ||
       tx.result.meta?.TransactionResult !== 'tesSUCCESS'
    ) {
        return NextResponse.json({ verified: false, reason: "Transaction invalid or failed" });
    }

    // You would then update the database here marking `escrow_sequence_host` or `escrow_sequence_guest`
    // with the validated txHash so the match can start.

    return NextResponse.json({ verified: true, deliveredAmount: tx.result.meta.delivered_amount });
  } catch (error) {
    console.error("XRPL Verify Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
