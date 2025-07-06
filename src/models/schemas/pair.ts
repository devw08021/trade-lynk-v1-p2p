import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface PairDocument extends Document {
  firstCoinId: ObjectId;
  firstCoin: string;
  secondCoinId: ObjectId;
  secondCoin: string;
  price: number;
  fee: number;
  duration: number;
  status: number; //  1 active , 2 deActive
  tikerRoot: string;
  createdAt: Date;
  updatedAt: Date;
}

const PairSchema = new Schema<PairDocument>(
  {
    tikerRoot: { type: String, required: true },
    firstCoinId: { type: Schema.Types.ObjectId, ref: "Coin", required: true },
    firstCoin: { type: String, required: true },
    secondCoinId: { type: Schema.Types.ObjectId, ref: "Coin", required: true },
    secondCoin: { type: String, required: true },
    price: { type: Number, required: true },
    fee: { type: Number, required: true },
    duration: { type: Number, required: true },
    status: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const PairModel = mongoose.model<PairDocument>("pair", PairSchema);
