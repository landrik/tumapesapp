import { Request, Response } from 'express';
import RecipientModel, { Recipient, DeliveryMethod } from '../data/recepients.model';
import { getCurrencyForCountry } from '../data/countries';
import { success, error } from '../utils/response';

interface CreateRecipientBody {
  firstName: string;
  lastName: string;
  nickname?: string;
  country: string;
  phone?: string;
  deliveryMethod: DeliveryMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  ifscCode?: string;
  sortCode?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  cashPickupNetwork?: string;
}

interface UpdateRecipientBody {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  ifscCode?: string;
  sortCode?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  cashPickupNetwork?: string;
}

// GET /v1/recipients
const listRecipients = async (req: Request, res: Response) => {
  const userRecipients = await RecipientModel.find({ userId: req.user.id });
  return success(res, { items: userRecipients });
};

// POST /v1/recipients
const createRecipient = async (req: Request, res: Response) => {
  const { firstName, lastName, country, deliveryMethod } = req.body as CreateRecipientBody;
  if (!firstName || !lastName || !country || !deliveryMethod) {
    return error(res, 'firstName, lastName, country, and deliveryMethod are required', 400, 'VALIDATION_ERROR');
  }

  // The country determines the currency — never trust a client-supplied
  // currency, since the two could otherwise drift out of sync (e.g. a
  // stale app version, or a client bug sending mismatched values).
  const currency = getCurrencyForCountry(country);
  if (!currency) {
    return error(
      res,
      `${country} is not currently a supported destination. See GET /v1/countries for the supported list.`,
      422,
      'UNSUPPORTED_COUNTRY'
    );
  }

  const recipientData: Partial<Recipient> = {
    userId: req.user.id,
    firstName,
    lastName,
    nickname: req.body.nickname || null,
    country: country.toUpperCase(),
    currency,
    phone: req.body.phone || null,
    deliveryMethod,
  };

  if (deliveryMethod === 'bank_transfer') {
    recipientData.bankName = req.body.bankName || null;
    recipientData.accountNumber = req.body.accountNumber || null;
    recipientData.accountName = req.body.accountName || null;
    recipientData.ifscCode = req.body.ifscCode || null;
    recipientData.sortCode = req.body.sortCode || null;
  } else if (deliveryMethod === 'mobile_money') {
    recipientData.mobileMoneyProvider = req.body.mobileMoneyProvider || null;
    recipientData.mobileMoneyNumber = req.body.mobileMoneyNumber || null;
  } else if (deliveryMethod === 'cash_pickup') {
    recipientData.cashPickupNetwork = req.body.cashPickupNetwork || null;
  }

  const recipient = await RecipientModel.create(recipientData);
  return success(res, recipient, 201);
};

// PATCH /v1/recipients/:id
const updateRecipient = async (req: Request, res: Response) => {
  const recipient = await RecipientModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!recipient) return error(res, 'Recipient not found', 404, 'NOT_FOUND');

  const updatable: (keyof UpdateRecipientBody)[] = [
    'firstName', 'lastName', 'nickname', 'phone',
    'bankName', 'accountNumber', 'accountName', 'ifscCode', 'sortCode',
    'mobileMoneyProvider', 'mobileMoneyNumber', 'cashPickupNetwork',
  ];
  const body = req.body as UpdateRecipientBody;
  updatable.forEach(field => {
    if (body[field] !== undefined) {
      (recipient as any)[field] = body[field];
    }
  });

  await recipient.save();

  return success(res, recipient);
};

// DELETE /v1/recipients/:id
const deleteRecipient = async (req: Request, res: Response) => {
  const deleted = await RecipientModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return error(res, 'Recipient not found', 404, 'NOT_FOUND');

  return success(res, { message: 'Recipient deleted successfully' });
};

export { listRecipients, createRecipient, updateRecipient, deleteRecipient };
