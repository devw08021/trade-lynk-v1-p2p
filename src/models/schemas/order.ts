import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface OrderDocument extends Document {
  orderCode: string;
  postId: ObjectId;
  postCode: string;
  buyerCode: number;
  buyerId: ObjectId;
  sellerId: ObjectId;
  sellerCode: number;
  firstCoinId: ObjectId;
  firstCoin: string;
  secondCoinId: ObjectId;
  secondCoin: string;
  payValue: number;
  receiveValue: number;
  price: string;
  startTime: Date;
  endTime: Date;
  side: number; //  0 buy , 1 sell
  status: number; // 0 open, 1 paid, 2 completed , 3 cancelled, 4 dispute, 5 dispute resolved, 6 time out
  disputeRaisedAt: Date;
  disputeResolvedAt: Date;
  disputeRaisedBy: number; // 0 buyer, 1 seller
  disputeTo: number; // 0 buyer, 1 seller
  tikerRoot: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    orderCode: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    postCode: { type: String, required: true },
    buyerCode: { type: Number, required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    sellerCode: { type: Number, required: true },
    firstCoinId: { type: Schema.Types.ObjectId, ref: "coin", required: true },
    firstCoin: { type: String, required: true },
    secondCoinId: { type: Schema.Types.ObjectId, ref: "coin", required: true },
    secondCoin: { type: String, required: true },
    payValue: { type: Number, required: true },
    receiveValue: { type: Number, required: true },
    price: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    side: { type: Number, required: true },
    status: { type: Number, default: 0 },
    disputeRaisedAt: { type: Date, default: null },
    disputeResolvedAt: { type: Date, default: null },
    disputeRaisedBy: { type: Number },
    disputeTo: { type: Number },
    tikerRoot: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.model<OrderDocument>("order", OrderSchema);
