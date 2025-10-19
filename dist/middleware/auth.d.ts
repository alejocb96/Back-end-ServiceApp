import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
declare const admin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
declare const providerOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
declare const userOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export { protect, admin, providerOrAdmin, userOrAdmin };
//# sourceMappingURL=auth.d.ts.map