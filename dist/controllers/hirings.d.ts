import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getHirings: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getHiring: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createHiring: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateHiringStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addPayment: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const rateHiring: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyHirings: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=hirings.d.ts.map