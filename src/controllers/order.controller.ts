import { Context } from "hono";
import {
  PairService,
  PostService,
  OrderService,
  WalletService,
  ChatService,
} from "@/services/index";
import { ValidationController } from "@/controllers/index";

const validateCtrl = new ValidationController();

const walletService = new WalletService();
const pairService = new PairService();
const postService = new PostService();
const orderService = new OrderService();
const chatService = new ChatService();
export class OrderController {
  getAllOrder = async (c: Context) => {
    try {
      const { type, page, limit, crypto, fiat, userId } = await c.req.query();

      let filter: any = {}

      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await orderService.getOrder(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };
  getActiveOrder = async (c: Context) => {
    try {
      const resp = await orderService.getOrder({ status: 0 });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };
  getDisputeOrder = async (c: Context) => {
    try {
      const { type, page, limit, crypto, fiat, userId } = await c.req.query();

      let filter: any = { status: { $in: [4, 5] } }

      if (type) filter = { ...filter, side: type == 'buy' ? 1 : type == 'sell' ? 0 : 0 }
      if (crypto) filter = { ...filter, firstCoin: crypto }
      if (fiat) filter = { ...filter, secondCoin: fiat }
      if (userId) filter = { ...filter, userId: { $ne: userId } }

      let options = { skip: Number(page ?? 0) * Number(limit ?? 0), limit: Number(limit ?? 20) }
      const resp = await orderService.getOrder(filter,options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  getOrderById = async (c: Context) => {
    try {
      const { id } = c.req.param();
      const resp = await orderService.getSingleOrdder(
        { _id: id },
        {},
        "postId"
      );
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  async addOrder(c: Context) {
    try {
      const { userCode, userId } = await c.get("user");
      const { adId, quantity } = await c.req.json();

      const validationPayload = [
        { field: "adId", type: "objectId", value: adId },
        { field: "quantity", type: "number", value: quantity },
      ];
      const { errors } = await validateCtrl.validate(validationPayload);
      if (Object.keys(errors).length > 0)
        return c.json(
          { success: false, errors, message: "VALIDATION_ERROR" },
          400
        );

      // get add details
      const addRep = await postService.getSinglePost({
        _id: adId,
        status: { $in: [0, 1, 4] },
      });
      if (!addRep?.success) return c.json(addRep, addRep?.code ?? 500);

      const {
        _id,
        postCode,
        pairId,
        userCode: ownerCode,
        userId: ownerId,
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        payValue,
        receiveValue,
        price,
        side,
        tikerRoot,
        reminingQuantity,
        minLimit,
        maxLimit,
      } = addRep?.data;

      if (reminingQuantity < quantity)
        return c.json({ success: false, message: "QUANTITY_EXCEEDED" }, 400);

      //if sell order then reduce balance
      if (side == 0) {
        const balanceResp = await walletService.debitAmount(
          userCode,
          "p2p",
          firstCoinId,
          quantity
        );
        if (!balanceResp?.success)
          return c.json(balanceResp, balanceResp?.code ?? 500);
      }

      let newDoc = {
        postId: _id,
        postCode:
          postCode ??
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        orderCode: Math.random().toString(36).substr(2, 9),
        buyerCode: side == 0 ? ownerCode : userCode,
        buyerId: side == 0 ? ownerId : userId,
        sellerId: side == 0 ? ownerId : ownerId,
        sellerCode: side == 0 ? ownerCode : ownerCode,
        firstCoinId,
        firstCoin,
        secondCoinId,
        secondCoin,
        payValue: price,
        receiveValue: quantity,
        price,
        side,
        userCode,
        userId,
        tikerRoot,
        startTime: Date.now(),
        endTime: Date.now() + 5 * 60 * 1000,
      };
      const resp = await orderService.addOrder(newDoc);
      if (!resp?.success) return c.json(resp, resp?.code ?? 500);

      // update ad quantity
      const adResp = await postService.updatePost(adId, {
        status: 1,
        $inc: {
          lockedQuantity: quantity,
          reminingQuantity: -quantity,
          totalOrder: 1,
        },
        $min: {
          minLimit: reminingQuantity - quantity, // This will set minLimit to quantity if it's smaller
          maxLimit: reminingQuantity - quantity,
        },
      });
      if (!adResp?.success) return c.json(adResp, adResp?.code ?? 500);

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async updateOrder(c: Context) {
    try {
      const {
        _id,
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
        return c.json(
          { success: false, errors, message: "VALIDATION_ERROR" },
          400
        );
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
      };
      const resp = await orderService.updateOrder(_id, newDoc);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getOrderUserHis = async (c: Context) => {
    try {
      const { userCode, userId } = await c.get("user");
      const { side, page, limit, crypto, fiat } = await c.req.query();

      let filter: any = {};
      if (side && side != "all")
        filter = {
          ...filter,
          side: side == "buy" ? 0 : side == "sell" ? 1 : 0,
        };
      if (crypto) filter = { ...filter, firstCoinId: crypto };
      if (fiat) filter = { ...filter, secondCoinId: fiat };
      if (userId) {
        filter.$or = [{ sellerId: userId }, { buyerId: userId }];
      }

      let options = {
        skip: Number(page ?? 0) * Number(limit ?? 0),
        limit: Number(limit ?? 20),
      };
      const resp = await orderService.getOrder(filter, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  //message
  getMessages = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const { page, limit } = await c.req.query();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      // if ([2, 5, 6].includes(OrderResp?.data?.status)) return c.json({ success: false, message: "ORDER_ALREADY_COMPLETED" }, 400);
      let options = {
        skip: Number(page ?? 0) * Number(limit ?? 0),
        limit: Number(limit ?? 20),
        sort: { _id: 1 },
      };
      const resp = await chatService.getMessage({ orderId: id }, options);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };
  addMessage = async (c: Context) => {
    try {
      const { userCode, userId } = await c.get("user");
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      const formData = await c.req.formData();
      const message = formData.get("message"); // type: FormDataEntryValue | null
      const attachment = formData.get("attachment"); // type: FormDataEntryValue | null

      let newMessage = {
        orderCode: OrderResp?.data?.orderCode,
        orderId: id,
        postCode: OrderResp?.data?.postCode,
        postId: OrderResp?.data?.postId,
        userCode: userCode,
        userId: userId,
        message: message,
        attachment: attachment instanceof File ? attachment.name : attachment,
      };
      const resp = await chatService.setMessage(newMessage);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  // Update Order status
  orderPaid = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 0)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);
      const resp = await orderService.updateOrder(id, { status: 1 });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  orderComplete = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 1)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);

      // means update balance to buyer
      const balanceResp = await walletService.creditAmount(
        OrderResp?.data?.buyerCode,
        "p2p",
        OrderResp?.data?.firstCoinId,
        OrderResp?.data?.receiveValue
      );
      if (!balanceResp?.success)
        return c.json(balanceResp, balanceResp?.code ?? 500);

      const resp = await orderService.updateOrder(id, { status: 2 });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      // update ad quantity
      const adResp = await postService.updatePost(OrderResp?.data?.postId, {
        status: 1,
        $inc: {
          lockedQuantity: -OrderResp?.data?.receiveValue,
        },
      });

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  orderDispute = async (c: Context) => {
    try {
      const { userCode, userId } = await c.get("user");
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 1)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);
      const resp = await orderService.updateOrder(id, {
        status: 4,
        disputeRaisedBy: OrderResp?.data?.buyerCode == userCode ? 0 : 1,
        disputeRaisedAt: new Date(),
      });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  orderCancel = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 0)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);
      const resp = await orderService.updateOrder(id, { status: 3 });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      //  update balance to buyer
      const balanceResp = await walletService.creditAmount(
        OrderResp?.data?.buyerCode,
        "p2p",
        OrderResp?.data?.firstCoinId,
        OrderResp?.data?.receiveValue
      );
      if (!balanceResp?.success)
        return c.json(balanceResp, balanceResp?.code ?? 500);

      // update ad quantity
      const adResp = await postService.updatePost(OrderResp?.data?.postId, {
        status: 1,
        $inc: {
          lockedQuantity: -resp?.data?.receiveValue,
          reminingQuantity: resp?.data?.receiveValue,
          totalOrder: 1,
        },
      });
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  orderDisputeResolvedBuyer = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id });
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 4)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);

      const {
        _id: orderId,
        postCode,
        pairId,
        buyerCode,
        sellerCode,
        side,
        firstCoinId,
        secondCoinId,
        payValue,
        receiveValue,
      } = OrderResp?.data;

      // if post is sell means update post to buyer
      const balanceResp = await walletService.creditAmount(
        OrderResp?.data?.buyerCode,
        "p2p",
        OrderResp?.data?.firstCoinId,
        OrderResp?.data?.receiveValue
      );
      if (!balanceResp?.success)
        return c.json(balanceResp, balanceResp?.code ?? 500);

      const updatePayload: any = {
        $inc: {
          lockedQuantity: -OrderResp?.data?.receiveValue,
        },
      };

      //  Add remaining quantity only for side == 1
      if (OrderResp?.data?.side === 0) {
        updatePayload.$inc.reminingQuantity = OrderResp?.data?.receiveValue;
      }

      //  Set status only if condition is met
      if (
        OrderResp?.data?.postId?.reminingQuantity <= 0 &&
        OrderResp?.data?.side === 0
      ) {
        updatePayload.$set = { status: 2 };
      }

      const resp = await orderService.updateOrder(id, {
        status: 5,
        disputeTo: 0,
        disputeResolvedAt: new Date(),
      });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };

  orderDisputeResolvedSeller = async (c: Context) => {
    try {
      const { id } = await c.req.param();
      const OrderResp = await orderService.getSingleOrdder({ _id: id }, {}, "postId");
      if (!OrderResp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);
      if ([2, 3, 5, 6].includes(OrderResp?.data?.status))
        return c.json(
          { success: false, message: "ORDER_ALREADY_COMPLETED" },
          400
        );
      // for paid status must be open 0
      if (OrderResp?.data?.status != 4)
        return c.json({ success: false, message: "ORDER_STATUS_INVALID" }, 400);

      // if post is sell means update post to buyer
      if (OrderResp?.data?.side == 0) {
        const balanceResp = await walletService.creditAmount(
          OrderResp?.data?.sellerCode,
          "p2p",
          OrderResp?.data?.firstCoinId,
          OrderResp?.data?.receiveValue
        );
        if (!balanceResp?.success)
          return c.json(balanceResp, balanceResp?.code ?? 500);
      }


      const updatePayload: any = {
        $inc: {
          lockedQuantity: -OrderResp?.data?.receiveValue,
        },
      };

      //  Add remaining quantity only for side == 1
      if (OrderResp?.data?.side === 1) {
        updatePayload.$inc.reminingQuantity = OrderResp?.data?.receiveValue;
      }

      //  Set status only if condition is met
      if (
        OrderResp?.data?.postId?.reminingQuantity <= 0 &&
        OrderResp?.data?.side === 1
      ) {
        updatePayload.$set = { status: 2 };
      }

      const resp = await orderService.updateOrder(id, {
        status: 5,
        disputeTo: 1,
        disputeResolvedAt: new Date(),
      });
      if (!resp?.success) return c.json(OrderResp, OrderResp?.code ?? 500);

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  };
}
