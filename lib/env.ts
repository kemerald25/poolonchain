import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_XRPL_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  TREASURY_WALLET_ADDRESS: z.string().optional(),
  SERVER_KEYPAIR_SEED: z.string().optional(),
  XAMAN_API_KEY: z.string().optional(),
  XAMAN_API_SECRET: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_XRPL_NETWORK: process.env.NEXT_PUBLIC_XRPL_NETWORK,
  TREASURY_WALLET_ADDRESS: process.env.TREASURY_WALLET_ADDRESS,
  SERVER_KEYPAIR_SEED: process.env.SERVER_KEYPAIR_SEED,
  XAMAN_API_KEY: process.env.XAMAN_API_KEY,
  XAMAN_API_SECRET: process.env.XAMAN_API_SECRET,
});
