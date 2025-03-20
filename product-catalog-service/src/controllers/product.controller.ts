import { Request, Response } from 'express';
import db from '../services/database';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string(),
    description: z.string(),
    categoryId: z.number().int().positive(),
    price: z.number().positive(),
    variantId: z.number().int().positive(),
});

export const getAllProducts = async (req: Request, res: Response) => {
    res.json(await db.select().from(products));
};

export const getProductBySKU = async (req: Request, res: Response) => {
    const SKU = req.params.sku;
    const result = await db.select().from(products).where(eq(products.SKU, SKU));
    if (result.length === 0) {
        res.status(404).json({
            message: `No product found with provided SKU: ${SKU}`,
        });
    } else {
        res.json(result);
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const parsedData = productSchema.parse(req.body);
        const result = await db.insert(products).values(parsedData);
        res.json(result);
    } catch (e) {
        res.status(400).send(e);
    }
};
