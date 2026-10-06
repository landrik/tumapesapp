import { Request, Response } from 'express';
import { SUPPORTED_COUNTRIES } from '../data/countries';
import { success } from '../utils/response';

// GET /v1/countries
const listCountries = (req: Request, res: Response) => {
  return success(res, { items: SUPPORTED_COUNTRIES });
};

export { listCountries };
