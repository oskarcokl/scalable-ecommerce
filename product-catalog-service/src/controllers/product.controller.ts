import { Request, Response } from 'express';

export const getAllProducts = async (req: Request, res: Response) => {
    res.send('Hello Controller\n');
};
