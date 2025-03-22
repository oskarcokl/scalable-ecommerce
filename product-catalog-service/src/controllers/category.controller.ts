import { Request, Response } from 'express';
import db from '../services/database';
import { categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

const categoriesInsertSchema = createInsertSchema(categories);
const categoriesUpdateSchema = createUpdateSchema(categories);

export const getAllCategories = async (req: Request, res: Response) => {
    res.json(await db.select().from(categories));
};

export const getCategoryById = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    const result = await db.select().from(categories).where(eq(categories.categoryId, categoryId));
    if (result.length === 0) {
        res.status(404).json({ message: 'No category for provided categoryId' });
    } else {
        res.json(result);
    }
};

export const getChildCategories = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.parentCategoryId, categoryId));
    res.json(result);
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const parsedBody = categoriesInsertSchema.parse(req.body);
        const result = await db.insert(categories).values(parsedBody);
        console.log(result);
        // TODO: The auto incrementing works kinda weirdly?
        res.json({ message: 'Category created successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    try {
        const parsedBody = categoriesUpdateSchema.parse(req.body);
        const result = await db
            .update(categories)
            .set(parsedBody)
            .where(eq(categories.categoryId, categoryId));
        console.log(result);
        res.json({ message: `Category ${categoryId} updated successfully` });
    } catch (error) {
        res.status(500).json(error);
    }
};
