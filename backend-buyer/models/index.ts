import mongoose, { Document, Schema, Model } from 'mongoose';

// Buyer User Schema (based on Python auth_controller)
export interface IBuyerUser extends Document {
  name: string;
  email: string;
  password: string; // Python used 'password'
  role: 'customer' | 'admin';
}

const buyerUserSchema = new Schema<IBuyerUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
});

// Product Item Schema (sub-document for Collection)
interface IProductItem {
  name: string;
  singlePrice: number;
  bouquetPrice: number;
  note?: string;
}

const productItemSchema = new Schema<IProductItem>({
  name: { type: String, required: true },
  singlePrice: { type: Number, required: true },
  bouquetPrice: { type: Number, required: true },
  note: { type: String }
});

// Collection Schema (based on Python schemas.py)
export interface IBuyerCollection extends Document {
  id: string; // Python uses string ID (e.g. 'carnation')
  title: string;
  description: string;
  image: string;
  items: IProductItem[];
}

const buyerCollectionSchema = new Schema<IBuyerCollection>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  items: [productItemSchema]
});

// Cart Item Schema (sub-document for Order)
interface ICartItem {
  id: string;
  name: string;
  singlePrice: number;
  bouquetPrice: number;
  quantity: number;
  collectionTitle: string;
}

const cartItemSchema = new Schema<ICartItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  singlePrice: { type: Number, required: true },
  bouquetPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  collectionTitle: { type: String, required: true }
});

// Buyer Order Schema (based on Python schemas.py)
export interface IBuyerOrder extends Document {
  order_id: string;
  items: ICartItem[];
  totalAmount: number;
  customerEmail?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

const buyerOrderSchema = new Schema<IBuyerOrder>({
  order_id: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, required: true },
  customerEmail: { type: String },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  status: { type: String, default: 'created' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Define models with explicit collection names to avoid conflict with existing backend
// But use what Python was using if we want to retain data
export const BuyerUser: Model<IBuyerUser> = mongoose.models.BuyerUser || mongoose.model<IBuyerUser>('BuyerUser', buyerUserSchema, 'buyer_users');
export const BuyerCollection: Model<IBuyerCollection> = mongoose.models.BuyerCollection || mongoose.model<IBuyerCollection>('BuyerCollection', buyerCollectionSchema, 'buyer_collections');
export const BuyerOrder: Model<IBuyerOrder> = mongoose.models.BuyerOrder || mongoose.model<IBuyerOrder>('BuyerOrder', buyerOrderSchema, 'buyer_orders');
