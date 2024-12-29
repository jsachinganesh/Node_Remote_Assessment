import { Request, Response, NextFunction } from 'express';


const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
    });
};


export default errorMiddleware