import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface PostDocument extends Document {
  userCode: number;
  userId: ObjectId;
  tikerRoot: string;
  pairId: ObjectId;
  firstCoinId: ObjectId;
  firstCoin: string;
  secondCoinId: ObjectId;
  secondCoin: string;
  price: string
  quantity: number;
  filledQuantity: number;
  reminingQuantity: number;
  lockedQuantity: number;
  minLimit: number;
  maxLimit: number;
  side: number;  //1 buy ,2 sell
  postId: number;
  expireAt: Date;
  payBy: string[];
  description: string;
  status: number;  //  0 open , 1 pending,2.completed,3.cancelled,4.dispute
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<PostDocument>({
  userCode: { type: Number, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pairId: { type: Schema.Types.ObjectId, ref: 'pair', required: true },
  tikerRoot: { type: String, required: true },
  firstCoinId: { type: Schema.Types.ObjectId, ref: 'coin', required: true },
  firstCoin: { type: String, required: true },
  secondCoinId: { type: Schema.Types.ObjectId, ref: 'coin', required: true },
  secondCoin: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
  filledQuantity: { type: Number, required: true },
  reminingQuantity: { type: Number, required: true },
  lockedQuantity: { type: Number, required: true },
  minLimit: { type: Number, required: true },
  maxLimit: { type: Number, required: true },
  side: { type: Number, required: true },
  postId: { type: Number, required: true, index: true },
  expireAt: { type: Date, required: true },
  payBy: { type: [], required: true },
  description: { type: String, required: true },
  status: { type: Number, required: true }

}, {
  timestamps: true
});


export const PostModel = mongoose.model<PostDocument>('post', PostSchema); 