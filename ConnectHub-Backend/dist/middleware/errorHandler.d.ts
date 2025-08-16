import { Request, Response, NextFunction } from 'express';
export interface ErrorWithStatus extends Error {
    statusCode?: number;
    status?: number;
}
export declare const errorHandler: (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => void;
