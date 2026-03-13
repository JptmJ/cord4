import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payout from '@/models/Payout';
import PayoutAudit from '@/models/PayoutAudit';
import { requireRole } from '@/lib/auth';

export async function POST(request, { params }) {
  const { user, error, status } = requireRole(request, 'OPS');
  if (error) return NextResponse.json({ error }, { status });

  await connectDB();

  const resolvedParams = await params;
  const payout = await Payout.findById(resolvedParams.id);
  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 });

  if (payout.status !== 'Draft') {
    return NextResponse.json(
      { error: `Cannot submit. Payout is currently "${payout.status}". Only Draft payouts can be submitted.` },
      { status: 400 }
    );
  }

  payout.status = 'Submitted';
  payout.updated_by = user.id;
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'SUBMITTED',
    performed_by: user.id,
    performed_by_name: user.name,
    performed_by_role: user.role,
  });

  return NextResponse.json({ message: 'Payout submitted successfully', payout });
}
