import { Context } from 'hono';
import { PairService, PostService, OrderService } from '@/services/index';
import { ValidationController } from '@/controllers/index'

const validateCtrl = new ValidationController()

const pairService = new PairService();
const postService = new PostService();
const orderService = new OrderService();
export class OrderController {


  getAllOrder = async (c: Context) => {
    try {
      const resp = await orderService.getOrder({});
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }
  getActiveOrder = async (c: Context) => {
    try {
      const resp = await orderService.getOrder({ status: 0 });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async addOrder(c: Context) {
    try {
      const { userCode, userId } = await c.get('user')

      const { postId, postCode, buyerCode, buyerId, sellerId, sellerCode, firstCoinId, firstCoin,
        secondCoinId, secondCoin, payValue, receiveValue, price, side
      } = await c.req.json();

      const validationPayload = [
        { field: "postId", type: "string", value: postId },
        { field: "postCode", type: "string", value: postCode },
        { field: "buyerCode", type: "string", value: buyerCode },
        { field: "buyerId", type: "string", value: buyerId },
        { field: "sellerId", type: "string", value: sellerId },
        { field: "sellerCode", type: "string", value: sellerCode },
        { field: "firstCoinId", type: "string", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin },
        { field: "secondCoinId", type: "string", value: secondCoinId },
        { field: "secondCoin", type: "string", value: secondCoin },
        { field: "payValue", type: "number", value: payValue },
        { field: "receiveValue", type: "number", value: receiveValue },
        { field: "price", type: "number", value: price },
        { field: "side", type: "number", value: side },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);
      let newDoc = {
        postId,
        postCode,
        buyerCode,
        buyerId,
        sellerId,
        sellerCode,
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        payValue,
        receiveValue,
        price,
        side,
        userCode,
        userId
      }
      const resp = await orderService.addOrder(newDoc);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }


  async updateOrder(c: Context) {
    try {

      const { _id, postId, postCode, buyerCode, buyerId, sellerId, sellerCode, firstCoinId, firstCoin,
        secondCoinId, secondCoin, payValue, receiveValue, price, side
      } = await c.req.json();

      const validationPayload = [
        { field: "postId", type: "string", value: postId },
        { field: "postCode", type: "string", value: postCode },
        { field: "buyerCode", type: "string", value: buyerCode },
        { field: "buyerId", type: "string", value: buyerId },
        { field: "sellerId", type: "string", value: sellerId },
        { field: "sellerCode", type: "string", value: sellerCode },
        { field: "firstCoinId", type: "string", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin },
        { field: "secondCoinId", type: "string", value: secondCoinId },
        { field: "secondCoin", type: "string", value: secondCoin },
        { field: "payValue", type: "number", value: payValue },
        { field: "receiveValue", type: "number", value: receiveValue },
        { field: "price", type: "number", value: price },
        { field: "side", type: "number", value: side },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);
      let newDoc = {
        postId,
        postCode,
        buyerCode,
        buyerId,
        sellerId,
        sellerCode,
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        payValue,
        receiveValue,
        price,
        side,
      }
      const resp = await orderService.updateOrder(_id, newDoc);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 