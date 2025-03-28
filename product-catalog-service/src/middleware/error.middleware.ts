import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
    constructor(public message: string, public status: number) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class InternalServerError extends HttpError {
    constructor(message: string) {
        super(message, 500);
    }
}

export const errorHandler = async (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    const status = err.status || 500;
    const message = err.message;

    res.status(status).json({
        error: {
            message,
            status,
        },
    });
};
