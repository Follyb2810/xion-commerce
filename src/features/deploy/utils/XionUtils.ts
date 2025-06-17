import { XION_CONSTANTS } from "../deploy.type";

export class XionUtils {
  
  static xionToUxion(amount: number | string): string {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount: must be a positive number');
    }
    return Math.floor(numAmount * XION_CONSTANTS.UXION_DECIMALS).toString();
  }


  static uxionToXion(amount: number | string): string {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount: must be a positive number');
    }
    return (numAmount / XION_CONSTANTS.UXION_DECIMALS).toString();
  }

  static isValidXionAddress(address: string): boolean {
    return /^xion1[a-z0-9]{38}$/.test(address);
  }

  static isValidTxHash(hash: string): boolean {
    return /^[A-F0-9]{64}$/i.test(hash);
  }
}