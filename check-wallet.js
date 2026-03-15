import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://localhost:27017/twisted_bliss";

const walletTransactionSchema = new mongoose.Schema({
  date: { type: String },
  aggregator: { type: String },
  type: { type: String },
  amount: { type: Number },
  referenceId: { type: String }
});

const WalletTxn = mongoose.model('WalletTransaction', walletTransactionSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const txns = await WalletTxn.find({});
  console.log("Wallet Txns:", txns);
  
  const added = txns.filter(t => t.type === 'add_funds').reduce((s, t) => s + t.amount, 0);
  const deducted = txns.filter(t => t.type === 'deduct_shipping').reduce((s, t) => s + t.amount, 0);
  console.log("Total Added:", added);
  console.log("Total Deducted:", deducted);
  process.exit(0);
}

run();
