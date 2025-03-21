import { Router } from 'express';
import {
    createProductVariant,
    getAllVariants,
    getVariantsForProduct,
    updateProductVariant,
} from '../controllers/variant.controller';

const router = Router();

router.get('/', getAllVariants);
router.get('/:id', getVariantsForProduct);
router.post('/:id', createProductVariant);
router.put('/:SKU', updateProductVariant);

export default router;
