import mongoose from 'mongoose';

// Schéma pour les personnes de référence
const ReferenceSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  price: { type: Number, required: true },
  info: { type: String }, // Informations utiles
  createdAt: { type: Date, default: Date.now }
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

  // Payment Steps
  // 30% Deposit
  deposit30: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String } // URL de la preuve de paiement
  },

  // 15% Installment 1
  payment15_1: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String } // URL de la preuve de paiement
  },

  // 15% Installment 2
  payment15_2: {
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    dueDate: Date,
    proofUrl: { type: String } // URL de la preuve de paiement
  },
  
  // Is the order fully completed?
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
