import { Request, Response } from 'express';
import * as adminService from './admin.service';

export const first = async (req: Request, res: Response) => {
  const result = await adminService.adminService();
  res.status(200).json(result);
};
