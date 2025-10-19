import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getServices: (req: Request, res: Response) => Promise<void>;
export declare const getService: (req: Request, res: Response) => Promise<void>;
export declare const createService: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateService: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteService: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const searchServices: (req: Request, res: Response) => Promise<void>;
export declare const calculateServicePrice: (req: Request, res: Response) => Promise<void>;
export declare const getServicesByProvider: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=services.d.ts.map