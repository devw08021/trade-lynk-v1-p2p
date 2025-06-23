import { getRepository } from "@/models/repositoryFactory";
import { PairModel, PostModel, OrderModel } from "@/models/schemas";
import { incBalanceRedis, decBalanceRedis } from '@/config/redis'


interface APIResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

export class PairService {
  private pairtRep = getRepository(PairModel);
  private postRep = getRepository(PostModel);
  private orderRep = getRepository(OrderModel);


  private createErrorResponse(message: string, code: number = 500): APIResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): APIResponse {
    return { success: true, message, code: 200, data };
  }

  // use filters to get filter record
  async getPairs(filter = {}): Promise<any> {
    try {
      const pairDoc = await this.pairtRep.find(filter);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getPairs");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }

  }

   async getSinglePair(filter = {}): Promise<any> {
    try {
      const pairDoc = await this.pairtRep.findOne(filter);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getPairs");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }

  async addPair(updateData: any): Promise<any> {
    try {
      const pairDoc = await this.pairtRep.create(updateData);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "addPair");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }

  async updatePair(pairId: string, updateData: any): Promise<any> {
    try {
      const upPair = await this.pairtRep.findByIdAndUpdate(pairId, updateData);
      if (!upPair) return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(upPair);
    } catch (error) {
      console.error(error, "updatePair");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);

    }
  }

}; 