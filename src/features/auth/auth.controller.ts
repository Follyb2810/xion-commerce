import { Request, Response } from 'express';
import * as authService from './auth.service';

export const first = async (req: Request, res: Response) => {
  const result = await authService.authService();
  res.status(200).json(result);
};
