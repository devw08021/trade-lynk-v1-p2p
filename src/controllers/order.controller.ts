import { Context } from 'hono';
import { WalletService, } from '@/services/index';

const walletService = new WalletService();
export class OrderController {

  creditAmount = async (c: Context) => {
    try {
      const { userCode } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await walletService.creditAmount(userCode, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async debitAmount(c: Context) {
    try {
      const { userCode } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await walletService.debitAmount(userCode, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }



} 