import { NextFunction, Request, Response } from 'express';
import db from '../services/database';
import { categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../middleware/error.middleware';
import { ZodError } from 'zod';

const categoriesInsertSchema = createInsertSchema(categories);
const categoriesUpdateSchema = createUpdateSchema(categories);

export const getAllCategories = async (req: Request, res: Response) => {
    res.json(await db.select().from(categories));
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = parseInt(req.params.id);
    const result = await db.select().from(categories).where(eq(categories.categoryId, categoryId));
    if (result.length === 0) {
        return next(new NotFoundError(`No category for provided ID: ${categoryId}`));
    }
    res.json(result);
};

export const getChildCategories = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.parentCategoryId, categoryId));
    res.json(result);
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = categoriesInsertSchema.parse(req.body);
        await db.insert(categories).values(parsedBody);
        res.status(201).json({ message: 'Category created successfully' });
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid category data'));
        }
        return next(new InternalServerError('Failed to create category'));
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = parseInt(req.params.id);
        const parsedBody = categoriesUpdateSchema.parse(req.body);

        const result = await db
            .update(categories)
            .set(parsedBody)
            .where(eq(categories.categoryId, categoryId))
            .returning();

        if (result.length === 0) {
            return next(new NotFoundError(`Category with id ${categoryId} not found`));
        }

        res.json({ message: `Category ${categoryId} updated successfully` });
    } catch (e) {
        if (e instanceof ZodError) {
            return next(new BadRequestError('Invalid category data'));
        }
        return next(new InternalServerError('Failed to update category'));
    }
};
