import db from '../services/database';
import { NextFunction, Request, Response } from 'express';
import { productVariants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../middleware/error.middleware';
import { ZodError } from 'zod';

const productVariantInsertSchema = createInsertSchema(productVariants);
const productVariantUpdateSchema = createUpdateSchema(productVariants);

export const getAllVariants = async (req: Request, res: Response) => {
    res.json(await db.select().from(productVariants));
};

export const getVariantsForProduct = async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const result = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));
    if (result.length === 0) {
        return next(new NotFoundError('No variants for provided productId'));
    }
    res.json(result);
};

export const createProductVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = parseInt(req.params.id);
        const parsedBody = productVariantInsertSchema.parse({ ...req.body, productId });
        await db.insert(productVariants).values(parsedBody);
        res.status(201).json({ message: 'Variant created successfully' });
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid variant data'));
        }
        return next(new InternalServerError('Failed to create variant'));
    }
};

export const updateProductVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SKU = req.params.SKU;
        const parsedBody = productVariantUpdateSchema.parse(req.body);

        const result = await db
            .update(productVariants)
            .set(parsedBody)
            .where(eq(productVariants.SKU, SKU))
            .returning();

        if (result.length === 0) {
            return next(new NotFoundError(`Variant with SKU ${SKU} not found`));
        }

        res.json({ message: `Variant ${SKU} updated successfully` });
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid variant data'));
        }
        return next(new InternalServerError('Failed to update variant'));
    }
};
