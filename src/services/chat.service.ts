import { getRepository } from "@/models/repositoryFactory";
import { PairModel, PostModel, OrderModel, ChatModel } from "@/models/schemas";
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
export class ChatService {
  private chatRep = getRepository(ChatModel);
  private orderRep = getRepository(OrderModel);

  private createErrorResponse(message: string, code: number = 500): APIResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): APIResponse {
    return { success: true, message, code: 200, data };
  }

  // use filters to get filter record
  async getMessage(filter = {}, options = {}, populate = ""): Promise<any> {
    try {
      const pairDoc = await this.chatRep.find(filter, options, populate);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "getOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }


  async setMessage(updateData: any): Promise<any> {
    try {
      const pairDoc = await this.chatRep.create(updateData);
      if (!pairDoc)
        return this.createErrorResponse("NOT_FOUND", 400);
      return this.createSuccessResponse(pairDoc);
    } catch (error) {
      console.error(error, "addOrder");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR", 500);
    }
  }


}; 