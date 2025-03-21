import { Router } from 'express';
import productRoutes from './product.routes';
import variantRoutes from './variant.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/product-variants', variantRoutes);

export default router;
