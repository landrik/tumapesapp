import { Request, Response } from 'express';
import TransferModel, { Transfer } from '../data/transfer.model';
import RecipientModel from '../data/recepients.model';
import corridors, { Corridor } from '../data/rates';
import { getQuotedRate } from './rates.controller';
import { success, error } from '../utils/response';

interface CreateTransferBody {
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: string;
  recipientId: string;
  deliveryMethod: string;
}

const generateReference = (): string => {
  const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return 'TP' + digits;
};

// POST /v1/transfers
const createTransfer = async (req: Request, res: Response) => {
  const { sendAmount, sendCurrency, receiveCurrency, recipientId, deliveryMethod } = req.body as CreateTransferBody;

  if (!sendAmount || !sendCurrency || !receiveCurrency || !recipientId || !deliveryMethod) {
    return error(res, 'sendAmount, sendCurrency, receiveCurrency, recipientId, and deliveryMethod are required', 400, 'VALIDATION_ERROR');
  }

  const recipient = await RecipientModel.findOne({ _id: recipientId, userId: req.user.id });
  if (!recipient) {
    return error(res, 'Recipient not found', 404, 'NOT_FOUND');
  }

  const corridor = (corridors as Corridor[]).find(
    c => c.from.toUpperCase() === sendCurrency.toUpperCase() && c.to.toUpperCase() === receiveCurrency.toUpperCase()
  );
  if (!corridor) {
    return error(res, `No rate available for ${sendCurrency} → ${receiveCurrency}`, 422, 'CORRIDOR_NOT_FOUND');
  }

  const quoted = await getQuotedRate(corridor);
  const rate = quoted.rate;

  const receiveAmount = parseFloat((sendAmount * rate).toFixed(2));
  const fee = corridor.fee;
  const totalDebit = parseFloat((parseFloat(sendAmount as unknown as string) + fee).toFixed(2));

  const transferData: Partial<Transfer> = {
    userId: req.user.id,
    reference: generateReference(),
    status: 'pending',
    sendAmount: parseFloat(sendAmount as unknown as string),
    sendCurrency: sendCurrency.toUpperCase(),
    receiveAmount,
    receiveCurrency: receiveCurrency.toUpperCase(),
    rate,
    fee,
    totalDebit,
    recipientId,
    recipientSnapshot: {
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      country: recipient.country,
      deliveryMethod: recipient.deliveryMethod,
    },
    deliveryMethod,
    estimatedDelivery: corridor.estimatedDelivery,
    completedAt: null,
  };

  const transfer = await TransferModel.create(transferData);
  return success(res, transfer, 201);
};

// POST /v1/transfers/:id/confirm
const confirmTransfer = async (req: Request, res: Response) => {
  const transfer = await TransferModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!transfer) return error(res, 'Transfer not found', 404, 'NOT_FOUND');

  if (transfer.status !== 'pending') {
    return error(res, `Cannot confirm a transfer with status "${transfer.status}"`, 400, 'INVALID_STATUS');
  }

  transfer.status = 'processing';
  await transfer.save();

  return success(res, transfer);
};

// GET /v1/transfers/:id
const getTransfer = async (req: Request, res: Response) => {
  const transfer = await TransferModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!transfer) return error(res, 'Transfer not found', 404, 'NOT_FOUND');
  return success(res, transfer);
};

// GET /v1/transfers?page=1&limit=20
const listTransfers = async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  const total = await TransferModel.countDocuments({ userId: req.user.id });
  const items = await TransferModel.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return success(res, { items, total, page, limit });
};

// DELETE /v1/transfers/:id  (cancel if pending)
const cancelTransfer = async (req: Request, res: Response) => {
  const transfer = await TransferModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!transfer) return error(res, 'Transfer not found', 404, 'NOT_FOUND');

  if (transfer.status !== 'pending') {
    return error(res, `Only pending transfers can be cancelled. Current status: "${transfer.status}"`, 400, 'INVALID_STATUS');
  }

  transfer.status = 'cancelled';
  await transfer.save();

  return success(res, { message: 'Transfer cancelled successfully', transfer });
};

export { createTransfer, confirmTransfer, getTransfer, listTransfers, cancelTransfer };
