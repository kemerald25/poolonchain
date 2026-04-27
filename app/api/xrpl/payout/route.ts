import { NextResponse } from 'next/server';
import { getXrplClient, getServerWallet } from '@/lib/xrpl/client';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const { matchId, winnerAddress, amountDrops } = await req.json();

    if (!env.TREASURY_WALLET_ADDRESS || !env.SERVER_KEYPAIR_SEED) {
       return NextResponse.json({ success: true, mock: true, payout: amountDrops });
    }

    const client = await getXrplClient();
    const wallet = getServerWallet();
    
    // Server payout logic. 
    // We pay from the Treasury wallet directly to the winner.
    const prepared = await client.autofill({
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: winnerAddress,
      Amount: String(amountDrops),
      Memos: [
          {
             Memo: {
                MemoData: Buffer.from(`wager_payout_${matchId}`).toString('hex'),
             }
          }
      ]
    });
    
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta && typeof result.result.meta !== "string" && result.result.meta.TransactionResult === "tesSUCCESS") {
         return NextResponse.json({ success: true, txHash: signed.hash });
    }

    return NextResponse.json({ success: false, reason: "XRPL Payout Transaction Failed" }, { status: 500 });
  } catch (error) {
    console.error("XRPL Payout Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
