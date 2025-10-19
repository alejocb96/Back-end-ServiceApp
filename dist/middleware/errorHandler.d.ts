import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    name: string;
    errors?: {
        [key: string]: {
            message: string;
        };
    };
}
declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map