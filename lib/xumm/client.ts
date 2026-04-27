import { XummSdk } from 'xumm-sdk';
import { env } from '../env';

export const getXummClient = () => {
   if (!env.XAMAN_API_KEY || !env.XAMAN_API_SECRET) {
       console.warn("Xaman credentials missing, using mock/simulation mode.");
       return null;
   }
   return new XummSdk(env.XAMAN_API_KEY, env.XAMAN_API_SECRET);
};
