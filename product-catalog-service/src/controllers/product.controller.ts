import { NextFunction, Request, Response } from 'express';
import db from '../services/database';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../middleware/error.middleware';
import { ZodError } from 'zod';

const productInsertSchema = createInsertSchema(products);
const productUpdateSchema = createUpdateSchema(products);

export const getAllProducts = async (req: Request, res: Response) => {
    const categoryId = req.query.category ? parseInt(req.query.category as string) : null;

    const productQuery = db.select().from(products);
    res.json(await db.select().from(products));
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const result = await db.select().from(products).where(eq(products.productId, id));
    if (result.length === 0) {
        return next(new NotFoundError(`No product for provided ID: ${id}`));
    }
    res.json(result);
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = productInsertSchema.parse(req.body);
        const result = await db.insert(products).values(parsedData);
        res.json(result);
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid product data'));
        }
        return next(new InternalServerError('Failed to create product'));
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const parsedData = productUpdateSchema.parse(req.body);

        const result = await db
            .update(products)
            .set(parsedData)
            .where(eq(products.productId, id))
            .returning();

        if (result.length === 0) {
            return next(new NotFoundError(`Product with id ${id} not found`));
        }

        res.json(result);
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid product data'));
        }
        return next(new InternalServerError('Failed to update product'));
    }
};
