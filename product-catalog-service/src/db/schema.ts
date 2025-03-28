import { relations } from 'drizzle-orm';
import {
    integer,
    pgTable,
    varchar,
    doublePrecision,
    pgEnum,
    serial,
    pgView,
} from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';

/**
 * I'm a bit lost as to what kind of information I need about products so I'm
 * just gonna list it here and roll with it.
 * - name
 * - description
 * - category
 * - sex
 * - size
 * - color
 * - media
 * - price
 *
 * Apparently the SKU has to be different for each variant of a product.
 * What are the common fields?
 * - name
 * - description
 * - category
 * - media
 *
 * All the other fields have to be associated with a SKU
 *
 */

export const products = pgTable('products', {
    productId: serial().primaryKey(),
    name: varchar().notNull(),
    description: varchar().notNull(),
    categoryId: integer().notNull(),
});

export const productMedia = pgTable('product_media', {
    productMediaId: serial().primaryKey(),
    productId: integer()
        .references(() => products.productId)
        .notNull(),
    link: varchar().notNull(),
});

/**
 * Categories should have a name and an id and a parent id. Since sneakers are
 * a sub category of shoes for example.
 * - category_id
 * - parent_category_id
 * - name
 */
export const categories = pgTable('categories', {
    categoryId: serial().primaryKey(),
    parentCategoryId: integer(),
    categoryName: varchar().notNull(),
});

/**
 * Establishes a one-to-one relationship to between a category and its parent
 * For example shoe being a parent category of a sneaker.
 */
export const categoryRelations = relations(categories, ({ one }) => ({
    parentCategory: one(categories, {
        fields: [categories.parentCategoryId],
        references: [categories.categoryId],
    }),
}));

export const sexEnum = pgEnum('sex', ['male', 'female', 'unisex']);

export const productVariants = pgTable('product_variants', {
    SKU: varchar({ length: 8 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => generateSKU()),
    sex: sexEnum(),
    color: varchar().notNull(),
    price: doublePrecision().notNull(),
    size: varchar(),
    productId: integer()
        .references(() => products.productId)
        .notNull(),
});

const generateSKU = () => {
    // FIXME: This randomly doesn't work but I don't want to deal with it right
    // now.

    // Generate random string of 3 uppercase letters
    const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');

    // Generate random string of 5 numbers
    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

    return `${letters}${numbers}`;
};

export const productView = pgView('product_view').as((qb) =>
    qb
        .select({
            productId: products.productId,
            name: products.name,
            description: products.description,
            categoryId: products.categoryId,
            categoryName: categories.categoryName,
            parentCategoryId: categories.parentCategoryId,
            // Variant fields (individual rows)
            variantSku: productVariants.SKU,
            variantColor: productVariants.color,
            variantSize: productVariants.size,
            variantPrice: productVariants.price,
            variantSex: productVariants.sex,
            // Just the first media URL
            mediaUrl: sql`(array_agg(${productMedia.link}))[1]`.as('mediaUrl'),
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.categoryId))
        .leftJoin(productVariants, eq(products.productId, productVariants.productId))
        .leftJoin(productMedia, eq(products.productId, productMedia.productId))
        .groupBy(
            products.productId,
            products.name,
            products.description,
            products.categoryId,
            categories.categoryName,
            categories.parentCategoryId,
            productVariants.SKU,
            productVariants.color,
            productVariants.size,
            productVariants.price,
            productVariants.sex
        )
);
