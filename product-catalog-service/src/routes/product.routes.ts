import { Router } from 'express';
import {
    getAllProducts,
    getProductBySKU,
    createProduct,
    updateProduct,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/:sku', getProductBySKU);
router.post('/', createProduct);
router.put('/:sku', updateProduct);

export default router;
