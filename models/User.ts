import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  name: { type: String }, // For display
  phone: { type: String },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
