import { integer, pgTable, varchar, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

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
 */

export const products = pgTable('products', {
    productId: integer().primaryKey().notNull(),
    name: varchar().notNull(),
    description: varchar().notNull(),
    categoryId: integer().notNull(),
});

export const productMedia = pgTable('product_media', {
    productMediaId: integer().primaryKey().generatedByDefaultAsIdentity(),
    productId: integer()
        .references(() => products.productId)
        .notNull(),
    link: varchar().notNull(),
});

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
