import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

interface IRefreshToken extends Document {
  token: string;
  userId: Schema.Types.ObjectId;
  expiryDate: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  expiryDate: { type: Date, required: true },
});

refreshTokenSchema.pre<IRefreshToken>('save', function (next) {
  this.token = crypto.createHash('sha256').update(this.token).digest('hex');
  next();
});

const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
