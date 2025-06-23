import { incBalanceRedis, decBalanceRedis } from '@/config/redis'


interface WalletResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

export class WalletService {

  private createErrorResponse(message: string, code: number = 500): WalletResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): WalletResponse {
    return { success: true, message, code: 200, data };
  }


  async creditAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await incBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, parseFloat(amount))
      if (!wallRedis) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 400,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "creditAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }

  }


  async debitAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await decBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, amount)

      console.log("🚀 ~ WalletService ~ debitAmount ~ wallRedis:", wallRedis)
      if (!wallRedis) {
        return {
          success: false,
          message: "INSUFFICIENT_BALANCE",
          code: 400,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "debitAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

}; 