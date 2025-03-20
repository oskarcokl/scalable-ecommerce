import { Router } from 'express';
import { getAllProducts, getProductBySKU, createProduct } from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/:sku', getProductBySKU);
router.post('/', createProduct);

export default router;
