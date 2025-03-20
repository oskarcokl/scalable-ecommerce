import db from './database';
import { seed } from 'drizzle-seed';
import * as productSchema from '../db/schema';

const clothingDescriptions = [
    'Soft cotton t-shirt with a relaxed fit and crew neckline.',
    'Lightweight linen blouse with rolled-up sleeves and button-down front.',
    'Classic denim jeans with a slim fit and slight stretch for comfort.',
    'Ribbed knit sweater with a cozy turtleneck and long sleeves.',
    'Flowy maxi dress with floral prints and adjustable straps.',
    'High-waisted corduroy pants with a straight-leg cut.',
    'Breathable athletic leggings with a high waistband for support.',
    'Fitted blazer with a single button closure and structured shoulders.',
    'Comfortable hoodie with a front pocket and soft fleece lining.',
    'Casual polo shirt with a ribbed collar and button placket.',
    'Lightweight bomber jacket with ribbed cuffs and a zip closure.',
    'Classic plaid flannel shirt with a button-up front and chest pocket.',
    'Tailored pencil skirt with a knee-length cut and hidden zipper.',
    'Oversized cardigan with chunky knit texture and front pockets.',
    'Faux leather biker jacket with an asymmetrical zipper.',
    'Cropped tank top with a ribbed texture and scoop neckline.',
    'Relaxed fit cargo pants with multiple utility pockets.',
    'Wrap dress with a tie waist and flutter sleeves.',
    'Slim-fit chino pants with a sleek, tapered silhouette.',
    'Lightweight puffer jacket with zippered pockets and a water-resistant finish.',
];

const clothingNames = [
    'Urban Edge Bomber',
    'Cozy Knit Sweater',
    'Everyday Essential Tee',
    'Classic Blue Jeans',
    'Weekend Flannel',
    'Chic Wrap Dress',
    'SportFlex Leggings',
    'Vintage Corduroy Pants',
    'Luxe Velvet Blazer',
    'Sleek Biker Jacket',
];

const main = async () => {
    await seed(db, productSchema).refine((f) => ({
        products: {
            columns: {
                categoryId: f.intPrimaryKey(),
                variantId: f.intPrimaryKey(),
                price: f.number({
                    minValue: 5,
                    maxValue: 50,
                    isUnique: false,
                    precision: 100,
                }),
                description: f.valuesFromArray({
                    values: clothingDescriptions,
                }),
                name: f.valuesFromArray({
                    values: clothingNames,
                }),
            },
        },
    }));
    return;
};

console.log('Start seeding');
main();
console.log('Done seeding');
