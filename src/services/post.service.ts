import { getRepository } from "@/models/repositoryFactory";
import { PairModel, PostModel, OrderModel } from "@/models/schemas";
import { WalletService } from "./wallet.service";

interface APIResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}
const walletService = new WalletService();

export class PostService {

  private pairtRep = getRepository(PairModel);
  private postRep = getRepository(PostModel);
  private orderRep = getRepository(OrderModel);
  private isRunningCancelPosts = false
  // use filters to get filter record
  private createErrorResponse(message: string, code: number = 500): APIResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): APIResponse {
    return { success: true, message, code: 200, data };
  }

  // use filters to get filter record
  async getPost(filter = {}, options = {}): Promise<any> {
    try {
      const pairDoc = await this.postRep.find(filter, options);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getPost");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }

  }

  async addPost(updateData: any): Promise<any> {
    try {

      if (updateData?.side == 2) {
        let dectectBal = await walletService.debitAmount(updateData.userCode, "p2p", updateData.firstCoinId, updateData.quantity);
        if (!dectectBal?.success) {
          return this.createErrorResponse("NOT_ENOUGH_BALANCE", 400);
        }
      }

      const newOrder = new PostModel({
        userId: updateData.userId,
        userCode: updateData.userCode,
        pairId: updateData.pairId,
        tikerRoot: updateData.tikerRoot,
        firstCoinId: updateData.firstCoinId,
        secondCoinId: updateData.secondCoinId,
        firstCoin: updateData.firstCoin,
        secondCoin: updateData.secondCoin,
        price: updateData.price,
        quantity: updateData.quantity,
        filledQuantity: 0,
        reminingQuantity: updateData.quantity,
        lockedQuantity: 0,
        minLimit: updateData.minLimit,
        maxLimit: updateData.maxLimit,
        status: 0,
        side: updateData.side,
        orderSide: updateData.orderSide,
        postCode: updateData.postCode,
        expireAt: updateData.expireAt ?? new Date().getTime() + 1000 * 60 * 60 * 24,
        payBy: ["bank", "card", "usdt", "btc"],
        description: updateData.description,
      })
      console.log("🚀 ~ PostService ~ addPost ~ newOrder:", newOrder)

      const pairDoc = await this.postRep.create(newOrder);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse("POST_CREATED_SUCESSFULLY");
    } catch (error) {
      console.error(error, "addPost");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }

  async updatePost(pairId: string, updateData: any): Promise<any> {
    try {
      const upPair = await this.postRep.findByIdAndUpdate(pairId, updateData);
      if (!upPair) return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(upPair);
    } catch (error) {
      console.error(error, "updatePost");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);

    }
  }

  async getSinglePost(filter = {}): Promise<any> {
    try {
      const pairDoc = await this.postRep.findOne(filter);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getPairs");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }


  // order cron
  async timeOutOpenPost(): Promise<any> {
    if (this.isRunningCancelPosts) {
      return;
    }

    this.isRunningCancelPosts = true;
    try {
      let totalProcessed = 0;
      const limit = 2;
      let skip = 0;

      while (true) {
        const { success, data } = await this.getPost(
          { status: { $in: [0, 1] }, expireAt: { $lte: new Date() }, isTimeOut: false },
          { skip, limit }
        );

        if (!success || !data || data.length === 0) break;

        for (const post of data?.data) {
          const { userCode, firstCoinId, quantity } = post;

          await this.updatePost(post._id,
            {
              isTimeOut: true,
              status: 5
            });

          if (post.side === 2) {
            await walletService.creditAmount(userCode, "p2p", firstCoinId, quantity);
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
      this.isRunningCancelPosts = false; // release lock
    }
  }

}; 