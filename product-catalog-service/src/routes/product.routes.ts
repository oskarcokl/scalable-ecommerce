import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);

export default router;
