import { Context } from 'hono';
import { PairService } from '@/services/index';
import { ValidationController } from '@/controllers/index'

const validateCtrl = new ValidationController()

const pairService = new PairService();
export class PairController {
  async getPairById(c: Context) {
    try {
      const { id: pairId } = await c.req.param();
      const resp = await pairService.getPairById(pairId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.error("🚀 ~ CurrencyController ~ getCurrencyById ~ error:", error)
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getAllPairs = async (c: Context) => {
    try {
      const { type, page, limit, crypto, fiat, userId } = await c.req.query();
      let filter: any = {}
      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await pairService.getPairs(filter, options);
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
        { field: "firstCoinId", type: "objectId", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin ?? "" },
        { field: "secondCoinId", type: "objectId", value: secondCoinId ?? "" },
        { field: "secondCoin", type: "string", value: secondCoin ?? "" },
        { field: "price", type: "number", value: parseFloat(price) },
        { field: "fee", type: "number", value: parseFloat(fee) ?? "" },
        { field: "duration", type: "number", value: parseFloat(duration) ?? "" },
        { field: "status", type: "number", value: parseFloat(status) },
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
      const { id: _id } = await c.req.param();
      const { firstCoinId, firstCoin, secondCoinId, secondCoin, price, fee, duration, status, tikerRoot } = await c.req.json();

      const validationPayload = [
        { field: "_id", type: "objectId", value: _id },
        { field: "firstCoinId", type: "objectId", value: firstCoinId },
        { field: "firstCoin", type: "string", value: firstCoin ?? "" },
        { field: "secondCoinId", type: "objectId", value: secondCoinId ?? "" },
        { field: "secondCoin", type: "string", value: secondCoin ?? "" },
        { field: "price", type: "number", value: parseFloat(price) },
        { field: "fee", type: "number", value: parseFloat(fee) ?? "" },
        { field: "duration", type: "number", value: parseFloat(duration) ?? "" },
        { field: "status", type: "number", value: parseFloat(status) },
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