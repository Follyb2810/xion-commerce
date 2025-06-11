import { Request, Response } from 'express';
import * as superService from './super.service';

export const first = async (req: Request, res: Response) => {
  const result = await superService.superService();
  res.status(200).json(result);
};
