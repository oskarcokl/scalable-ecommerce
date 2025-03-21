import { Request, Response } from 'express';
import db from '../services/database';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

const productInsertSchema = createInsertSchema(products);
const productUpdateSchema = createUpdateSchema(products);

export const getAllProducts = async (req: Request, res: Response) => {
    res.json(await db.select().from(products));
};

export const getProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await db.select().from(products).where(eq(products.productId, id));
    if (result.length === 0) {
        res.status(404).json({
            message: `No product found with provided ID: ${id}`,
        });
    } else {
        res.json(result);
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const parsedData = productInsertSchema.parse(req.body);
        const result = await db.insert(products).values(parsedData);
        res.json(result);
    } catch (e) {
        // TODO: Handle errors better
        res.status(400).send(e);
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const parsedData = productUpdateSchema.parse(req.body);
        const result = await db.update(products).set(parsedData).where(eq(products.productId, id));
        res.json(result);
    } catch (e) {
        // TODO: Handle errors better
        res.status(400).send(e);
    }
};
