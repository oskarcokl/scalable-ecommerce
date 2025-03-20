import { integer, pgTable, varchar, doublePrecision } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
    SKU: varchar({ length: 8 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => generateSKU()),
    name: varchar().notNull(),
    description: varchar().notNull(),
    categoryId: integer().notNull(),
    price: doublePrecision().notNull(),
    variantId: integer().notNull(),
});

export const productMedia = pgTable('product_media', {
    productMediaId: integer().primaryKey().generatedByDefaultAsIdentity(),
    SKU: varchar({ length: 8 })
        .references(() => products.SKU)
        .notNull(),
    link: varchar().notNull(),
});

const generateSKU = () => {
    // Generate random string of 3 uppercase letters
    const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');

    // Generate random string of 5 numbers
    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

    return `${letters}${numbers}`;
};
