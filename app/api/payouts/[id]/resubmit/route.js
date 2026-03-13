import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payout from '@/models/Payout';
import PayoutAudit from '@/models/PayoutAudit';
import { requireRole } from '@/lib/auth';

export async function POST(request, { params }) {
  const { user, error, status } = requireRole(request, 'OPS');
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { reason } = body;

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Resubmit reason is mandatory' }, { status: 400 });
  }

  await connectDB();

  const resolvedParams = await params;
  const payout = await Payout.findById(resolvedParams.id);
  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 });

  if (payout.status !== 'Rejected') {
    return NextResponse.json(
      { error: `Cannot resubmit. Payout is currently "${payout.status}". Only Rejected payouts can be resubmitted.` },
      { status: 400 }
    );
  }
  payout.status = 'Resubmitted';
  payout.decision_reason = '';
  payout.updated_by = user.id;
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: 'RESUBMITTED',
    performed_by: user.id,
    performed_by_name: user.name,
    performed_by_role: user.role,
    note: reason.trim(),
  });

  return NextResponse.json({ message: 'Payout resubmitted for approval', payout });
}
