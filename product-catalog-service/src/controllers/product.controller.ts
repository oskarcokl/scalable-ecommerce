import { NextFunction, Request, Response } from 'express';
import db from '../services/database';
import { categories, products, productsView } from '../db/schema';
import { AnyColumn, asc, desc, eq, sql } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../middleware/error.middleware';
import { ZodError } from 'zod';

const productInsertSchema = createInsertSchema(products);
const productUpdateSchema = createUpdateSchema(products);

const getCategoryHierarchy = async (categoryId: number, categoryHierarchy: any[] = []) => {
    console.log('getCategoryHierarchy');
    const result = await db.select().from(categories).where(eq(categories.categoryId, categoryId));

    if (result.length !== 0) {
        const data = { categoryName: result[0].categoryName, categoryId: result[0].categoryId };
        categoryHierarchy.push(data);

        if (result[0].parentCategoryId && result[0].parentCategoryId != result[0].categoryId) {
            categoryHierarchy = await getCategoryHierarchy(
                result[0].parentCategoryId,
                categoryHierarchy
            );
        }
    }

    return categoryHierarchy;
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = req.query.category ? parseInt(req.query.category as string) : null;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

        const sortDirParam = req.query.sortDir as string | undefined;
        if (sortDirParam && !['asc', 'desc'].includes(sortDirParam)) {
            return next(new BadRequestError('sortDir must be either "asc" or "desc"'));
        }
        const sortDir = sortDirParam === 'desc' ? desc : asc;

        const validColumns = [
            'productId',
            'name',
            'description',
            'categoryId',
            'categoryName',
            'parentCategoryId',
            'variantSku',
            'variantColor',
            'variantSize',
            'variantPrice',
            'variantSex',
            'mediaUrl',
        ] as const;

        const sortColumnParam = req.query.sortColumn as (typeof validColumns)[number] | undefined;
        if (sortColumnParam && !validColumns.includes(sortColumnParam)) {
            return next(
                new BadRequestError(`sortColumn must be one of : ${validColumns.join(', ')}`)
            );
        }
        // NOTE: Not sure about the type asigment here?
        const sortColumn = productsView[sortColumnParam ?? 'name'] as AnyColumn;

        const query = db
            .selectDistinct()
            .from(productsView)
            .limit(limit)
            .offset(offset * limit)
            .orderBy(sortDir(sortColumn));
        const whereClauses: any[] = [];

        if (categoryId) {
            whereClauses.push(eq(productsView.categoryId, categoryId));
        }

        if (whereClauses.length > 0) {
            query.where(sql.join(whereClauses, sql` AND `));
        }

        const productResults = await query;

        let categoryHierarchy = null;
        if (categoryId) {
            categoryHierarchy = await getCategoryHierarchy(categoryId);
            categoryHierarchy.reverse();
        }

        res.json({
            products: productResults,
            categoryHierarchy: categoryHierarchy,
        });
    } catch (error) {
        return next(error);
    }
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
