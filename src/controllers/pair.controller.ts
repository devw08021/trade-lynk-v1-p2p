import { Context } from 'hono';
import { PairService } from '@/services/index';
import { ValidationController } from '@/controllers/index'

const validateCtrl = new ValidationController()

const pairService = new PairService();
export class PairController {


  getAllPairs = async (c: Context) => {
    try {
      const resp = await pairService.getPairs({});
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }
  getActivePair = async (c: Context) => {
    try {
      const resp = await pairService.getPairs({ status: 1 });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async addPair(c: Context) {
    try {
      const { firstCoinId, firstCoin, secondCoinId, secondCoin, price, fee, duration, status, tikerRoot } = await c.req.json();

      const validationPayload = [
        { field: "firstCoinId", type: "string", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin ?? "" },
        { field: "secondCoinId", type: "string", value: secondCoinId ?? "" },
        { field: "secondCoin", type: "string", value: secondCoin ?? "" },
        { field: "price", type: "string", value: price ?? "" },
        { field: "fee", type: "string", value: fee ?? "" },
        { field: "duration", type: "string", value: duration ?? "" },
        { field: "status", type: "string", value: status ?? "" },
        { field: "tikerRoot", type: "string", value: tikerRoot ?? "" },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);
      let newPair = {
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        price,
        fee,
        duration,
        status,
        tikerRoot
      }
      const resp = await pairService.addPair(newPair);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }


  async updatePair(c: Context) {
    try {
      const { _id, firstCoinId, firstCoin, secondCoinId, secondCoin, price, fee, duration, status, tikerRoot } = await c.req.json();

      const validationPayload = [
        { field: "_id", type: "string", value: _id },
        { field: "firstCoinId", type: "string", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin ?? "" },
        { field: "secondCoinId", type: "string", value: secondCoinId ?? "" },
        { field: "secondCoin", type: "string", value: secondCoin ?? "" },
        { field: "price", type: "string", value: price ?? "" },
        { field: "fee", type: "string", value: fee ?? "" },
        { field: "duration", type: "string", value: duration ?? "" },
        { field: "status", type: "string", value: status ?? "" },
        { field: "tikerRoot", type: "string", value: tikerRoot ?? "" },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json({ success: false, errors, message: "VALIDATION_ERROR" }, 400);

      let newPair = {
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        price,
        fee,
        duration,
        status,
        tikerRoot
      }
      const resp = await pairService.updatePair(_id, newPair);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

} 