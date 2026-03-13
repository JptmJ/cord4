import mongoose from '@/lib/mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  upi_id: { type: String, default: '' },
  bank_account: { type: String, default: '' },
  ifsc: { type: String, default: '', uppercase: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
