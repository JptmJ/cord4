import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payout from '@/models/Payout';
import PayoutAudit from '@/models/PayoutAudit';
import Vendor from '@/models/Vendor';
import User from '@/models/User';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(request) {
  const { user, error, status } = requireAuth(request);
  if (error) return NextResponse.json({ error }, { status });

  await connectDB();

  const { searchParams } = new URL(request.url);
  const filterStatus = searchParams.get('status');
  const filterVendor = searchParams.get('vendor_id');

  const query = {};
  if (filterStatus) query.status = filterStatus;
  if (filterVendor) query.vendor_id = filterVendor;

  const payouts = await Payout.find(query)
    .populate('vendor_id', 'name upi_id')
    .populate('created_by', 'name email role')
    .sort({ createdAt: -1 });

  return NextResponse.json({ payouts });
}

export async function POST(request) {
  const { user, error, status } = requireRole(request, 'OPS');
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { vendor_id, amount, mode, note } = body;

  if (!vendor_id) return NextResponse.json({ error: 'Vendor is required' }, { status: 400 });
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
  }
  if (!['UPI', 'IMPS', 'NEFT'].includes(mode)) {
    return NextResponse.json({ error: 'Mode must be UPI, IMPS, or NEFT' }, { status: 400 });
  }

  await connectDB();

  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  if (!vendor.is_active) return NextResponse.json({ error: 'Vendor is inactive' }, { status: 400 });

  const payout = await Payout.create({
    vendor_id,
    amount: Number(amount),
    mode,
    note: note?.trim() || '',
    status: 'Draft',
    created_by: user.id,
  });

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'CREATED',
    performed_by: user.id,
    performed_by_name: user.name,
    performed_by_role: user.role,
  });

  const populated = await Payout.findById(payout._id)
    .populate('vendor_id', 'name upi_id')
    .populate('created_by', 'name email role');

  return NextResponse.json({ payout: populated }, { status: 201 });
}
