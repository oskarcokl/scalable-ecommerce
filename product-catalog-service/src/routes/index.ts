import { Router } from 'express';
import productRoutes from './product.routes';
import variantRoutes from './variant.routes';
import categoryRoutes from './category.routes';
import mediaRoutes from './media.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/product-variants', variantRoutes);
router.use('/categories', categoryRoutes);
router.use('/product-media', mediaRoutes);

export default router;
