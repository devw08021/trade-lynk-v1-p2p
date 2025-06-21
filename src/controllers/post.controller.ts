import { Context } from 'hono';
import { PairService, PostService, OrderService } from '@/services/index';
import { ValidationController } from '@/controllers/index'

const validateCtrl = new ValidationController()

const pairService = new PairService();
const postService = new PostService();
const orderService = new OrderService();
export class PostController {


  getAllPost = async (c: Context) => {
    try {
      const resp = await postService.getPost({});
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

  async addPost(c: Context) {
    try {
      const { userCode, userId } = await c.get('user')

      const { pairId, price, quantity, minLimit, maxLimit, side, payBy, description } = await c.req.json();

      const validationPayload = [
        { field: "pairId", type: "string", value: pairId },
        { field: "price", type: "string", value: price },
        { field: "quantity", type: "string", value: quantity },
        { field: "minLimit", type: "number", value: minLimit },
        { field: "maxLimit", type: "number", value: maxLimit },
        { field: "side", type: "number", value: side },
        { field: "payBy", type: "string", value: payBy },
        { field: "description", type: "string", value: description ?? "" },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);
      let newDoc = {
        pairId,
        price,
        quantity,
        minLimit,
        maxLimit,
        side,
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

} 