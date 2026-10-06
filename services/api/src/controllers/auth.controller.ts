import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import UserModel, { DeliveryMethod } from '../data/user.model';
import KycModel from '../data/kyc.model';
import { sign, verify } from '../utils/jwt';
import { success, error } from '../utils/response';

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  country: string;
  currency: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  token: string;
}

interface ResetPasswordBody {
  email: string;
}

const buildUserResponse = async (user: InstanceType<typeof UserModel>) => {
  const kyc = await KycModel.findOne({ userId: user.userId });
  const { password, ...safe } = user.toObject();

  return {
    ...safe,
    kycStatus: kyc?.kycStatus || 'unverified',
    kycVerifiedAt: kyc?.kycVerifiedAt || null,
  };
};

// POST /v1/auth/register
const register = async (req: Request, res: Response) => {
  const {
    email, password, firstName, lastName, nickname,
    country, currency, phone, deliveryMethod,
    mobileMoneyProvider, mobileMoneyNumber,
  } = req.body as RegisterBody;

  if (!email || !password || !firstName || !lastName || !country || !currency || !phone || !deliveryMethod) {
    return error(
      res,
      'email, password, firstName, lastName, country, currency, phone, and deliveryMethod are required',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (deliveryMethod === 'mobile_money' && (!mobileMoneyProvider || !mobileMoneyNumber)) {
    return error(res, 'mobileMoneyProvider and mobileMoneyNumber are required for mobile_money', 400, 'VALIDATION_ERROR');
  }

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return error(res, 'An account with that email already exists', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    userId: 'usr_' + uuidv4().replace(/-/g, '').slice(0, 8),
    email,
    password: passwordHash,
    firstName,
    lastName,
    nickname,
    country,
    currency,
    phone,
    deliveryMethod,
    mobileMoneyProvider,
    mobileMoneyNumber,
  });

  const token = sign({ id: user.userId, email: user.email });
  const userResponse = await buildUserResponse(user);

  return success(res, { token, user: userResponse }, 201);
};

// POST /v1/auth/login
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    return error(res, 'email and password are required', 400, 'VALIDATION_ERROR');
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return error(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = sign({ id: user.userId, email: user.email });
  const userResponse = await buildUserResponse(user);

  return success(res, { token, user: userResponse });
};

// POST /v1/auth/logout
const logout = (req: Request, res: Response) => {
  // Stateless JWTs: nothing to invalidate server-side without a token blocklist.
  return success(res, { message: 'Logged out successfully' });
};

// POST /v1/auth/refresh
const refresh = (req: Request, res: Response) => {
  const { token } = req.body as RefreshBody;
  if (!token) {
    return error(res, 'token is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const decoded = verify(token);
    const newToken = sign({ id: decoded.id, email: decoded.email });
    return success(res, { token: newToken });
  } catch (err) {
    return error(res, 'Invalid or expired token', 401, 'TOKEN_INVALID');
  }
};

// POST /v1/auth/reset-password
const resetPassword = async (req: Request, res: Response) => {
  const { email } = req.body as ResetPasswordBody;
  if (!email) {
    return error(res, 'email is required', 400, 'VALIDATION_ERROR');
  }

  // Always return the same message whether or not the account exists,
  // to avoid leaking which emails are registered.
  return success(res, { message: 'If an account with that email exists, a reset link has been sent.' });
};

export { register, login, logout, refresh, resetPassword };
