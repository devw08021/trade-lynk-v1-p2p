import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface PairDocument extends Document {
  userCode: number;
  userId: ObjectId;
  firstCoinId: ObjectId;
  firstCoin: string;
  secondCoinId: ObjectId;
  secondCoin: string;
  price: string
  fee: string;
  duration: number;
  status: number;  //  1 active , 2 deActive
  tikerRoot: string;
  createdAt: Date;
  updatedAt: Date;
}

const PairSchema = new Schema<PairDocument>({
  userCode: { type: Number, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tikerRoot: { type: String, required: true },
  firstCoinId: { type: Schema.Types.ObjectId, ref: 'Coin', required: true },
  firstCoin: { type: String, required: true },
  secondCoinId: { type: Schema.Types.ObjectId, ref: 'Coin', required: true },
  secondCoin: { type: String, required: true },
  price: { type: String, required: true },
  fee: { type: String, required: true },
  duration: { type: Number, required: true },
  status: { type: Number, required: true }

}, {
  timestamps: true
});


export const PairModel = mongoose.model<PairDocument>('pair', PairSchema); 