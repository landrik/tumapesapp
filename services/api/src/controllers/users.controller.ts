import { Request, Response } from 'express';
import UserModel, { NotificationPrefs } from '../data/user.model';
import { success, error } from '../utils/response';

interface UpdateMeBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  currency?: string;
}

interface SavePushTokenBody {
  token: string;
}

interface UpdateNotificationPrefsBody {
  transferUpdates?: boolean;
  promotions?: boolean;
  rateAlerts?: boolean;
  pushEnabled?: boolean;
}

const sanitizeUser = (user: Record<string, any>) => {
  const { password, ...safe } = user;
  return safe;
};

// GET /v1/users/me
const getMe = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
  return success(res, sanitizeUser(user.toObject()));
};

// PATCH /v1/users/me
const updateMe = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

  const allowed: (keyof UpdateMeBody)[] = ['firstName', 'lastName', 'phone', 'country', 'currency'];
  const body = req.body as UpdateMeBody;
  allowed.forEach(field => {
    if (body[field] !== undefined) {
      (user as any)[field] = body[field];
    }
  });

  await user.save();

  return success(res, sanitizeUser(user.toObject()));
};

// POST /v1/users/push-token
const savePushToken = async (req: Request, res: Response) => {
  const { token } = req.body as SavePushTokenBody;
  if (!token) return error(res, 'Push token is required', 400, 'VALIDATION_ERROR');

  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

  user.pushToken = token;
  await user.save();

  return success(res, { message: 'Push token saved' });
};

// GET /v1/users/notification-prefs
const getNotificationPrefs = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
  return success(res, user.notificationPrefs);
};

// PATCH /v1/users/notification-prefs
const updateNotificationPrefs = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ userId: req.user.id });
  if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

  const allowed: (keyof NotificationPrefs)[] = ['transferUpdates', 'promotions', 'rateAlerts', 'pushEnabled'];
  const body = req.body as UpdateNotificationPrefsBody;
  allowed.forEach(field => {
    if (body[field] !== undefined) {
      user.notificationPrefs[field] = body[field] as boolean;
    }
  });

  await user.save();

  return success(res, user.notificationPrefs);
};

export { getMe, updateMe, savePushToken, getNotificationPrefs, updateNotificationPrefs };
