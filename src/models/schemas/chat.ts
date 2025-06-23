import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ChatDocument extends Document {
  orderCode: string;
  postId: ObjectId;
  postCode: string;
  orderId: ObjectId;
  userCode: number;
  userId: ObjectId;
  manageId: ObjectId;
  managerCode: string;
  message: string;
  attachment: string;
  status: number; // 0 send, 1 read,
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<ChatDocument>({
  orderCode: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'post', required: true },
  postCode: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'order', required: true },
  userCode: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  manageId: { type: Schema.Types.ObjectId, ref: 'user', default: null },
  managerCode: { type: String, default: null },
  message: { type: String, default: null },
  attachment: { type: String, default: null },
  status: { type: Number, default: 0 }
}, {
  timestamps: true
});


export const ChatModel = mongoose.model<ChatDocument>('chat', ChatSchema); 