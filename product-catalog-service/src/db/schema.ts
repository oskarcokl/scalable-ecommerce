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

// NOTE: This was fucking painful!!!
export const productsView = pgView('products_view', {
    productId: integer('product_id').notNull(),
    name: varchar('name').notNull(),
    description: varchar('description').notNull(),
    categoryId: integer('category_id').notNull(),
    categoryName: varchar('category_name'),
    parentCategoryId: integer('parent_category_id'),
    variantSku: varchar('variant_sku'),
    variantColor: varchar('variant_color'),
    variantSize: varchar('variant_size'),
    variantPrice: doublePrecision('variant_price'),
    variantSex: sexEnum('variant_sex'),
    mediaUrl: varchar('mediaUrl'),
}).as(sql`
    SELECT
        p.product_id,
        p.name,
        p.description,
        p.category_id,
        c.category_name,
        c.parent_category_id,
        pv.sku as variant_sku,
        pv.color as variant_color,
        pv.size as variant_size,
        pv.price as variant_price,
        pv.sex as variant_sex,
        (SELECT link FROM product_media WHERE product_id = p.product_id LIMIT 1) as "mediaUrl"
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN product_variants pv ON p.product_id = pv.product_id
`); // NOTE: Have to use raw SQL otherwise the type system complains. And I have
// to explicitly define the shape of the view otherwise drizzle cant figure
// out the column types and we cant query the view properly.
