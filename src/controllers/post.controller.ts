import { Context } from 'hono';
import { PairService, PostService, OrderService, WalletService } from '@/services/index';
import { ValidationController } from '@/controllers/index'

const validateCtrl = new ValidationController()

const pairService = new PairService();
const postService = new PostService();
const orderService = new OrderService();
const walletService = new WalletService();

export class PostController {


  getAllPost = async (c: Context) => {
    try {
      const { type, page, limit, crypto, fiat, userId } = await c.req.query();

      let filter: any = {}
      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await postService.getPost(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }
  getActivePost = async (c: Context) => {
    try {
      const resp = await postService.getPost({ status: 0 });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  // get post for by filter
  getPostByFilterForDashBoard = async (c: Context) => {
    try {
      const { type, page, limit, crypto, fiat, userId } = await c.req.query();

      let filter: any = {
        status: { $in: [0, 1] },
        isTimeOut: false,
        reminingQuantity: { $gt: 0 },
      }
      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await postService.getPost(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async addPost(c: Context) {
    try {
      const { userCode, userId } = await c.get('user')

      const { pairId, price, quantity, minLimit, maxLimit, side, payBy, description } = await c.req.json();

      const validationPayload = [
        { field: "pairId", type: "objectId", value: pairId },
        { field: "price", type: "number", value: price },
        { field: "quantity", type: "number", value: quantity },
        { field: "minLimit", type: "number", value: minLimit },
        { field: "maxLimit", type: "number", value: maxLimit },
        { field: "side", type: "string", value: side },
        { field: "payBy", type: "string", value: payBy },
        { field: "description", type: "rerequired", value: description ?? "" },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);

      // get pair is record
      const pair = await pairService.getSinglePair({ _id: pairId, status: 1 });
      if (!pair?.success) return c.json({ success: false, message: "PAIR_NOT_FOUND" }, 400);

      if (side == 'sell') {
        const balanceResp = await walletService.debitAmount(
          userCode,
          "p2p",
          pair?.data?.firstCoinId,
          quantity
        );
        if (!balanceResp?.success)
          return c.json(balanceResp, balanceResp?.code ?? 500); I
      }
      let newDoc = {
        pairId: pair?.data?._id,
        tikerRoot: pair?.data?.tikerRoot,
        firstCoinId: pair?.data?.firstCoinId,
        secondCoinId: pair?.data?.secondCoinId,
        firstCoin: pair?.data?.firstCoin,
        secondCoin: pair?.data?.secondCoin,
        postCode: Math.random().toString(36).substr(2, 9),
        price,
        quantity,
        minLimit,
        maxLimit,
        side: side == 'buy' ? 0 : side == 'sell' ? 1 : 0,
        payBy,
        description,
        userCode,
        userId
      }
      const resp = await postService.addPost(newDoc);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }


  async updatePair(c: Context) {
    try {
      const { _id, pairId, price, quantity, minLimit, maxLimit, side, payBy, description } = await c.req.json();

      const validationPayload = [
        { field: "_id", type: "string", value: _id },
        { field: "pairId", type: "string", value: pairId },
        { field: "price", type: "string", value: price },
        // { field: "quantity", type: "string", value: quantity },
        { field: "minLimit", type: "number", value: minLimit },
        { field: "maxLimit", type: "number", value: maxLimit },
        // { field: "side", type: "number", value: side },
        { field: "payBy", type: "string", value: payBy },
        { field: "description", type: "string", value: description ?? "" },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);
      let newDoc = {
        price,
        minLimit,
        maxLimit,
        payBy,
        description,
      }
      const resp = await postService.updatePost(_id, newDoc);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  // get post for by filter
  getPostUserHis = async (c: Context) => {
    try {
      const { userCode, userId } = await c.get('user')
      const { side, page, limit, crypto, fiat } = await c.req.query();

      let filter: any = {}
      if (side && side != "all") filter = { ...filter, side: side == 'buy' ? 0 : side == 'sell' ? 1 : 0 }
      if (crypto) filter = { ...filter, firstCoinId: crypto }
      if (fiat) filter = { ...filter, secondCoinId: fiat }
      if (userId) filter = { ...filter, userId: userId }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await postService.getPost(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 