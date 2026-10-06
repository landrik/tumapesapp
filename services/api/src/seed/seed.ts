import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Readable } from 'stream';
import bcrypt from 'bcryptjs';
import UserModel from '../data/user.model';
import KycModel from '../data/kyc.model';
import RecipientModel from '../data/recepients.model';
import TransferModel from '../data/transfer.model';

/**
 * Uploads a tiny placeholder buffer into the kycUploads GridFS bucket
 * and returns the resulting file's ObjectId. Used only to satisfy the
 * Kyc model's required frontImageId/backImageId/selfieId fields with
 * real, retrievable GridFS files rather than fake ObjectIds that would
 * 404 if anyone actually tried to fetch them via GET /v1/kyc/document/:fileId.
 */
const uploadPlaceholderFile = (filename: string): Promise<mongoose.Types.ObjectId> => {
  return new Promise((resolve, reject) => {
    const db = mongoose.connection.db;
    if (!db) return reject(new Error('MongoDB connection is not ready'));

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'kycUploads' });
    const placeholderContent = Buffer.from(`Seed placeholder file: ${filename}`);

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { seed: true, mimetype: 'text/plain' },
    });

    Readable.from(placeholderContent)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id as mongoose.Types.ObjectId));
  });
};

const clearCollections = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    KycModel.deleteMany({}),
    RecipientModel.deleteMany({}),
    TransferModel.deleteMany({}),
  ]);

  // Also clear any previously seeded GridFS files so re-running the
  // seed script doesn't pile up orphaned placeholder uploads.
  const db = mongoose.connection.db;
  if (db) {
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'kycUploads' });
    const files = await db.collection('kycUploads.files').find({ 'metadata.seed': true }).toArray();
    await Promise.all(files.map(f => bucket.delete(f._id).catch(() => undefined)));
  }
};

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI environment variable is required');

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding');

  await clearCollections();
  console.log('Cleared existing collections');

  // --- Demo user (matches README test credentials) ---
  const passwordHash = await bcrypt.hash('Password123', 10);

  const demoUser = await UserModel.create({
    userId: 'usr_001',
    firstName: 'Landrik',
    lastName: 'Demo',
    email: 'test@example.com',
    password: passwordHash,
    country: 'GB',
    currency: 'GBP',
    phone: '+44 7700 900123',
    deliveryMethod: 'bank_transfer',
    notificationPrefs: {
      transferUpdates: true,
      promotions: false,
      rateAlerts: true,
      pushEnabled: true,
    },
  });
  console.log(`Created demo user: ${demoUser.email} (userId: ${demoUser.userId})`);

  // A second, freshly-registered-looking user with no KYC yet, to
  // exercise the "unverified" / empty-state paths in the frontend.
  const secondUser = await UserModel.create({
    userId: 'usr_002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: await bcrypt.hash('SecurePass1', 10),
    country: 'GB',
    currency: 'GBP',
    phone: '+44 7700 900456',
    deliveryMethod: 'mobile_money',
    mobileMoneyProvider: 'MTN Mobile Money',
    mobileMoneyNumber: '+44 7700 900456',
  });
  console.log(`Created second user: ${secondUser.email} (userId: ${secondUser.userId}, no KYC yet)`);

  // --- KYC: verified for the demo user ---
  const [frontImageId, backImageId, selfieId] = await Promise.all([
    uploadPlaceholderFile('passport-front.jpg'),
    uploadPlaceholderFile('passport-back.jpg'),
    uploadPlaceholderFile('selfie.jpg'),
  ]);

  await KycModel.create({
    userId: demoUser.userId,
    documentType: 'passport',
    frontImageId,
    backImageId,
    selfieId,
    kycStatus: 'verified',
    kycSubmittedAt: '2024-01-18T09:00:00.000Z',
    kycVerifiedAt: '2024-01-20T14:22:00.000Z',
  });
  console.log('Created verified KYC record for demo user');

  // --- Recipients (matching the examples in README) ---
  const amara = await RecipientModel.create({
    userId: demoUser.userId,
    firstName: 'Amara',
    lastName: 'Okafor',
    nickname: 'Mum',
    country: 'NG',
    currency: 'NGN',
    phone: '+234 803 123 4567',
    deliveryMethod: 'bank_transfer',
    bankName: 'First Bank of Nigeria',
    accountNumber: '2034567890',
    accountName: 'Amara Okafor',
  });

  const kwame = await RecipientModel.create({
    userId: demoUser.userId,
    firstName: 'Kwame',
    lastName: 'Mensah',
    country: 'GH',
    currency: 'GHS',
    deliveryMethod: 'mobile_money',
    mobileMoneyProvider: 'MTN Mobile Money',
    mobileMoneyNumber: '+233 24 456 7890',
  });

  const priya = await RecipientModel.create({
    userId: demoUser.userId,
    firstName: 'Priya',
    lastName: 'Nair',
    nickname: 'Sister',
    country: 'IN',
    currency: 'INR',
    phone: '+91 98765 43210',
    deliveryMethod: 'bank_transfer',
    bankName: 'State Bank of India',
    accountNumber: '30123456789',
    accountName: 'Priya Nair',
    ifscCode: 'SBIN0001234',
  });

  console.log(`Created 3 recipients for demo user: ${amara.firstName}, ${kwame.firstName}, ${priya.firstName}`);

  // --- Transfers (one per status, so every state is exercisable) ---
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();

  await TransferModel.create([
    {
      userId: demoUser.userId,
      reference: 'TP10000001',
      status: 'pending',
      sendAmount: 100,
      sendCurrency: 'GBP',
      receiveAmount: 16850.00,
      receiveCurrency: 'KES',
      rate: 168.50,
      fee: 2.99,
      totalDebit: 102.99,
      recipientId: amara._id.toString(),
      recipientSnapshot: {
        firstName: amara.firstName,
        lastName: amara.lastName,
        country: amara.country,
        deliveryMethod: amara.deliveryMethod,
      },
      deliveryMethod: 'bank_transfer',
      estimatedDelivery: '5 minutes',
      completedAt: null,
    },
    {
      userId: demoUser.userId,
      reference: 'TP10000002',
      status: 'processing',
      sendAmount: 250,
      sendCurrency: 'GBP',
      receiveAmount: 4550.00,
      receiveCurrency: 'GHS',
      rate: 18.20,
      fee: 2.49,
      totalDebit: 252.49,
      recipientId: kwame._id.toString(),
      recipientSnapshot: {
        firstName: kwame.firstName,
        lastName: kwame.lastName,
        country: kwame.country,
        deliveryMethod: kwame.deliveryMethod,
      },
      deliveryMethod: 'mobile_money',
      estimatedDelivery: '5 minutes',
      completedAt: null,
    },
    {
      userId: demoUser.userId,
      reference: 'TP10000003',
      status: 'completed',
      sendAmount: 500,
      sendCurrency: 'GBP',
      receiveAmount: 53750.00,
      receiveCurrency: 'INR',
      rate: 107.50,
      fee: 1.49,
      totalDebit: 501.49,
      recipientId: priya._id.toString(),
      recipientSnapshot: {
        firstName: priya.firstName,
        lastName: priya.lastName,
        country: priya.country,
        deliveryMethod: priya.deliveryMethod,
      },
      deliveryMethod: 'bank_transfer',
      estimatedDelivery: '30 minutes',
      completedAt: daysAgo(3),
      createdAt: daysAgo(3),
    },
    {
      userId: demoUser.userId,
      reference: 'TP10000004',
      status: 'failed',
      sendAmount: 75,
      sendCurrency: 'GBP',
      receiveAmount: 1361.25,
      receiveCurrency: 'GHS',
      rate: 18.20,
      fee: 2.49,
      totalDebit: 77.49,
      recipientId: kwame._id.toString(),
      recipientSnapshot: {
        firstName: kwame.firstName,
        lastName: kwame.lastName,
        country: kwame.country,
        deliveryMethod: kwame.deliveryMethod,
      },
      deliveryMethod: 'mobile_money',
      estimatedDelivery: '5 minutes',
      completedAt: null,
      createdAt: daysAgo(5),
    },
    {
      userId: demoUser.userId,
      reference: 'TP10000005',
      status: 'cancelled',
      sendAmount: 120,
      sendCurrency: 'GBP',
      receiveAmount: 20220.00,
      receiveCurrency: 'KES',
      rate: 168.50,
      fee: 2.99,
      totalDebit: 122.99,
      recipientId: amara._id.toString(),
      recipientSnapshot: {
        firstName: amara.firstName,
        lastName: amara.lastName,
        country: amara.country,
        deliveryMethod: amara.deliveryMethod,
      },
      deliveryMethod: 'bank_transfer',
      estimatedDelivery: '5 minutes',
      completedAt: null,
      createdAt: daysAgo(1),
    },
  ]);
  console.log('Created 5 transfers (pending, processing, completed, failed, cancelled)');

  console.log('\nSeed complete. Test credentials:');
  console.log('  Email:    test@example.com');
  console.log('  Password: Password123');
  console.log('  (Second user with no KYC: jane@example.com / SecurePass1)');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
