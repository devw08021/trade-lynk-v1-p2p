import { getRepository } from "@/models/repositoryFactory";
import { PairModel, PostModel, OrderModel } from "@/models/schemas";


interface APIResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

export class PostService {

  private pairtRep = getRepository(PairModel);
  private postRep = getRepository(PostModel);
  private orderRep = getRepository(OrderModel);

  // use filters to get filter record
  private createErrorResponse(message: string, code: number = 500): APIResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): APIResponse {
    return { success: true, message, code: 200, data };
  }

  // use filters to get filter record
  async getPost(filter = {}): Promise<any> {
    try {
      const pairDoc = await this.postRep.find(filter);
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
        postId: updateData.postId,
        expireAt: updateData.expireAt,
        payBy: ["bank", "card", "usdt", "btc"],
        description: updateData.description,
      })

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

}; 