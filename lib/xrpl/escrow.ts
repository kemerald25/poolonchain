import { env } from '../env';
import { randomBytes } from 'crypto';
// import cc from 'five-bells-condition';

export function generateCryptoCondition() {
    // In production, uncomment the five-bells-condition library to accurately buffer the URI.
    // const preimageData = randomBytes(32);
    // const fulfillment = new cc.PreimageSha256();
    // fulfillment.setPreimage(preimageData);
    // const conditionHex = fulfillment.getConditionUri().toUpperCase(); // formats specifically to ledger
    // return { fulfillment: fulfillment.serializeUri(), condition: conditionHex };

    return { 
        fulfillment: 'mock_fulfillment_' + randomBytes(4).toString('hex'), 
        condition: 'MOCK_CONDITION_HEX_8A7B6C...' 
    };
}

export function buildEscrowPayload(amountDrops: number, destWallet: string, conditionHex: string, matchId: string) {
    // Standard XRPL Escrow parameters:
    // Requires CancelAfter (time constraint) to auto-refund
    // Requires Condition to lock
    
    // Set expiry to 10 minutes from now (XRPL time is seconds since 2000-01-01)
    const xrplEpoch = 946684800;
    const cancelAfter = Math.floor(Date.now() / 1000) - xrplEpoch + (10 * 60);

    return {
        TransactionType: 'EscrowCreate',
        Destination: destWallet,
        Amount: amountDrops.toString(),
        Condition: conditionHex,
        CancelAfter: cancelAfter,
        Memos: [
            {
               Memo: {
                  MemoData: Buffer.from(`wager_${matchId}`).toString('hex'),
               }
            }
        ]
    };
}
