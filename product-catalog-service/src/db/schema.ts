import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
    SKU: varchar({ length: 8 }).notNull().primaryKey(),
    name: varchar().notNull(),
    description: varchar().notNull(),
    categoryId: integer().notNull(),
    price: integer().notNull(),
    variantId: integer().notNull(),
});

export const productMedia = pgTable('product_media', {
    productMediaId: integer().primaryKey().generatedByDefaultAsIdentity(),
    SKU: varchar({ length: 8 }).notNull(),
    link: varchar().notNull(),
});
