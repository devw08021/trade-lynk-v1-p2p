import { getRepository } from "@/models/repositoryFactory";
import { PairModel, PostModel, OrderModel } from "@/models/schemas";
import { incBalanceRedis, decBalanceRedis } from '@/config/redis'
import { WalletService, PostService } from "./index";


interface APIResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

const walletService = new WalletService();
const postService = new PostService();
export class OrderService {
  private pairtRep = getRepository(PairModel);
  private postRep = getRepository(PostModel);
  private orderRep = getRepository(OrderModel);
  private isRunningCancelOrders = false

  private createErrorResponse(message: string, code: number = 500): APIResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): APIResponse {
    return { success: true, message, code: 200, data };
  }

  // use filters to get filter record
  async getOrder(filter = {}, options = {}, populate = ""): Promise<any> {
    try {
      const pairDoc = await this.orderRep.find(filter, options, populate);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }

  async getSingleOrdder(filter = {}, options = {}, populate = ""): Promise<any> {
    try {
      const pairDoc = await this.orderRep.findOne(filter, options, populate);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }
  async addOrder(updateData: any): Promise<any> {
    try {
      const pairDoc = await this.orderRep.create(updateData);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "addOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }

  async updateOrder(pairId: string, updateData: any): Promise<any> {
    try {
      const upPair = await this.orderRep.findByIdAndUpdate(pairId, updateData);
      if (!upPair) return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(upPair);
    } catch (error) {
      console.error(error, "updateOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);

    }
  }


  // order cron

  async timeOutOpenOrder(): Promise<any> {
    if (this.isRunningCancelOrders) {
      return;
    }

    this.isRunningCancelOrders = true;
    try {
      let totalProcessed = 0;
      const limit = 2;
      let skip = 0;

      while (true) {
        const { success, data } = await this.getOrder(
          { status: 0, endTime: { $lte: new Date() } },
          { skip, limit }
        );

        if (!success || !data || data.length === 0) break;

        for (const order of data?.data) {
          const { sellerCode, firstCoinId, receiveValue, postId } = order;

          await this.updateOrder(order._id,
            {
              status: 6,
            });
          await postService.updatePost(postId,
            { $inc: { lockedQuantity: -receiveValue, reminingQuantity: receiveValue, totalOrder: -1 }, }
          );
          if (order.side === 2) {
            await walletService.creditAmount(sellerCode, "p2p", firstCoinId, receiveValue);
          }

          totalProcessed++;
        }

        skip += data.length;

        if (data.length < limit) break; // no more records
      }

      return { success: true, totalProcessed };
    } catch (err) {
      console.error("🚀 ~ cancelOpenOrder ~ Error:", err);
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    } finally {
      this.isRunningCancelOrders = false; // release lock
    }
  }

}; 