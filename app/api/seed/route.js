import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  // Simple protection - require a secret
  const { secret } = await request.json().catch(() => ({}));
  if (secret !== (process.env.SEED_SECRET || 'seed_payout_mvp')) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  await connectDB();
  const mongoose = (await import('mongoose')).default;
  const db = mongoose.connection.db;

  await db.collection('users').deleteMany({});
  await db.collection('vendors').deleteMany({});
  await db.collection('payouts').deleteMany({});
  await db.collection('payoutaudits').deleteMany({});

  const hashedOps = await bcrypt.hash('ops123', 10);
  const hashedFin = await bcrypt.hash('fin123', 10);

  const users = await db.collection('users').insertMany([
    { email: 'ops@demo.com', password: hashedOps, role: 'OPS', name: 'Ops User', createdAt: new Date(), updatedAt: new Date() },
    { email: 'finance@demo.com', password: hashedFin, role: 'FINANCE', name: 'Finance User', createdAt: new Date(), updatedAt: new Date() },
  ]);

  const vendors = await db.collection('vendors').insertMany([
    { name: 'Acme Corp', upi_id: 'acme@upi', bank_account: '1234567890', ifsc: 'HDFC0001234', is_active: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Tech Solutions', upi_id: 'techsol@upi', bank_account: '9876543210', ifsc: 'ICIC0005678', is_active: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Global Supplies', upi_id: '', bank_account: '5555444433', ifsc: 'SBIN0009999', is_active: true, createdAt: new Date(), updatedAt: new Date() },
  ]);

  const opsId = Object.values(users.insertedIds)[0];
  const vendorId = Object.values(vendors.insertedIds)[0];

  const payout = await db.collection('payouts').insertOne({
    vendor_id: vendorId,
    amount: 5000,
    mode: 'NEFT',
    note: 'Monthly retainer',
    status: 'Draft',
    decision_reason: '',
    created_by: opsId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection('payoutaudits').insertOne({
    payout_id: payout.insertedId,
    action: 'CREATED',
    performed_by: opsId,
    performed_by_name: 'Ops User',
    performed_by_role: 'OPS',
    note: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({
    message: 'Database seeded successfully',
    credentials: {
      ops: { email: 'ops@demo.com', password: 'ops123' },
      finance: { email: 'finance@demo.com', password: 'fin123' },
    },
    counts: { users: 2, vendors: 3, payouts: 1 },
  });
}
