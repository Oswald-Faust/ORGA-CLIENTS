import mongoose from 'mongoose';

const ReferenceSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  price: { type: Number, required: true },
  info: { type: String }, // Informations utiles
  createdAt: { type: Date, default: Date.now },

  // Coordonnées bancaires
  bankDetails: {
    iban: { type: String },
    bic: { type: String },
    bankName: { type: String },
    accountHolder: { type: String }
  },

  // Payment Steps for each reference
  deposit70: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String }
  },
  payment15_1: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String }
  },
  payment15_2: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String }
  }
});

const OrderSchema = new mongoose.Schema({
  clientEmail: { type: String, required: true, index: true },
  firstName: String,
  lastName: String,
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, default: 0 }, // Prix Total TTC défini par le client
  itemCount: { type: Number, default: 1 },
  seller: { type: String }, // For performance tracking
  
  // Liste des personnes de référence
  references: [ReferenceSchema],
  
  // Is the order fully completed?
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
