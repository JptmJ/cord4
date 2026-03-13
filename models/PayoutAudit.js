import mongoose from '@/lib/mongoose';

const PayoutAuditSchema = new mongoose.Schema({
  payout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', required: true },
  action: {
    type: String,
    enum: ['CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED'],
    required: true,
  },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performed_by_name: { type: String, required: true },
  performed_by_role: { type: String, required: true },
  note: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.PayoutAudit || mongoose.model('PayoutAudit', PayoutAuditSchema);
