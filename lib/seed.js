import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  await db.collection('users').deleteMany({});
  await db.collection('vendors').deleteMany({});
  await db.collection('payouts').deleteMany({});
  await db.collection('payoutaudits').deleteMany({});
  console.log('Cleared existing data');

  const hashedOps = await bcrypt.hash('ops123', 10);
  const hashedFin = await bcrypt.hash('fin123', 10);

  const users = await db.collection('users').insertMany([
    {
      email: 'ops@demo.com',
      password: hashedOps,
      role: 'OPS',
      name: 'Ops User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: 'finance@demo.com',
      password: hashedFin,
      role: 'FINANCE',
      name: 'Finance User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Users seeded:', Object.values(users.insertedIds).length);

  const opsUserId = Object.values(users.insertedIds)[0];

  const vendorNames = [
    'Acme Corp',
    'Tech Solutions',
    'Global Supplies',
    'NextGen Systems',
    'BlueSky Services',
    'GreenLeaf Traders',
    'Rapid Logistics',
    'BrightFuture Ltd',
    'Quantum Retail',
    'UrbanEdge Pvt Ltd',
  ];

  const vendorDocs = vendorNames.map((name, i) => ({
    name,
    upi_id: `vendor${i + 1}@upi`,
    bank_account: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ifsc: 'HDFC0001234',
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const vendors = await db.collection('vendors').insertMany(vendorDocs);
  console.log('Vendors seeded:', vendorDocs.length);

  const vendorIds = Object.values(vendors.insertedIds);

  const modes = ['NEFT', 'UPI', 'IMPS'];
  const statuses = ['Draft', 'Pending', 'Approved'];

  const payoutDocs = [];

  for (let i = 0; i < 25; i++) {
    payoutDocs.push({
      vendor_id: vendorIds[Math.floor(Math.random() * vendorIds.length)],
      amount: Math.floor(Math.random() * 9000 + 1000),
      mode: modes[Math.floor(Math.random() * modes.length)],
      note: `Payment batch ${i + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      decision_reason: '',
      created_by: opsUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const payouts = await db.collection('payouts').insertMany(payoutDocs);
  console.log('Payouts seeded:', payoutDocs.length);

  const payoutIds = Object.values(payouts.insertedIds);

  const auditDocs = payoutIds.map((payoutId, i) => ({
    payout_id: payoutId,
    action: 'CREATED',
    performed_by: opsUserId,
    performed_by_name: 'Ops User',
    performed_by_role: 'OPS',
    note: `Initial creation for payout ${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.collection('payoutaudits').insertMany(auditDocs);

  console.log('Audit logs seeded:', auditDocs.length);

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('OPS:     ops@demo.com / ops123');
  console.log('FINANCE: finance@demo.com / fin123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});