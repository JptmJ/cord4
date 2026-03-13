import mongoose from '@/lib/mongoose';

const PayoutSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'] },
  mode: { type: String, enum: ['UPI', 'IMPS', 'NEFT'], required: true },
  note: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Resubmitted', 'Approved', 'Rejected'],
    default: 'Draft',
  },
  decision_reason: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
