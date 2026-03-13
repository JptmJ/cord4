import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payout from '@/models/Payout';
import PayoutAudit from '@/models/PayoutAudit';
import Vendor from '@/models/Vendor';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const { user, error, status } = requireAuth(request);
  if (error) return NextResponse.json({ error }, { status });

  await connectDB();

  const resolvedParams = await params;
  const payout = await Payout.findById(resolvedParams.id)
    .populate('vendor_id', 'name upi_id bank_account ifsc')
    .populate('created_by', 'name email role')
    .populate('updated_by', 'name email role');

  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 });

  const resolvedAuditParams = await params;

  const audits = await PayoutAudit.find({ payout_id: resolvedAuditParams.id }).sort({ createdAt: 1 });

  return NextResponse.json({ payout, audits });
}
