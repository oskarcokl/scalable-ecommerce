import db from '../services/database';
import { Request, Response } from 'express';
import { productVariants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

const productVariantInsertSchema = createInsertSchema(productVariants);
const productVariantUpdateSchema = createUpdateSchema(productVariants);

export const getAllVariants = async (req: Request, res: Response) => {
    res.json(await db.select().from(productVariants));
};

export const getVariantsForProduct = async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const result = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));
    if (result.length === 0) {
        res.status(404).json({ message: 'No variants for provided productId' });
    } else {
        res.json(result);
    }
};

export const createProductVariant = async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    try {
        const parsedBody = productVariantInsertSchema.parse({ ...req.body, productId });
        const result = await db.insert(productVariants).values(parsedBody);
        console.log(result);
        res.json({ message: 'Variant created successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
};

export const updateProductVariant = async (req: Request, res: Response) => {
    const SKU = req.params.SKU;
    console.log(req.body);
    try {
        const parsedBody = productVariantUpdateSchema.parse({ ...req.body });
        const result = await db
            .update(productVariants)
            .set(parsedBody)
            .where(eq(productVariants.SKU, SKU));
        console.log(result);
        res.json({ message: `Variant ${SKU} updated successfully` });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
};
