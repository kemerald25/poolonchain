import { Client, Wallet } from 'xrpl';
import { env } from '../env';

// We default to testnet for safe development operations unless overridden
const XRPL_NETWORK = process.env.NEXT_PUBLIC_XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233';

let clientInstance: Client | null = null;

export async function getXrplClient(): Promise<Client> {
    if (clientInstance && clientInstance.isConnected()) {
        return clientInstance;
    }

    clientInstance = new Client(XRPL_NETWORK);
    await clientInstance.connect();
    return clientInstance;
}

export function getServerWallet(): Wallet {
    if (!env.SERVER_KEYPAIR_SEED) {
        throw new Error("SERVER_KEYPAIR_SEED env variable is missing");
    }
    return Wallet.fromSeed(env.SERVER_KEYPAIR_SEED);
}
