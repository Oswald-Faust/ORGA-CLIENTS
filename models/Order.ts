import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  clientEmail: { type: String, required: true, index: true },
  firstName: String,
  lastName: String,
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  itemCount: { type: Number, default: 1 },
  seller: { type: String }, // For performance tracking

  // Payment Steps
  // 30% Deposit
  deposit30: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date
  },

  // 15% Installment 1
  payment15_1: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date
  },

  // 15% Installment 2
  payment15_2: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date
  },
  
  // Is the order fully completed?
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
