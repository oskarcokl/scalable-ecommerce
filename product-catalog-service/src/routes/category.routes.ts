import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getChildCategories,
    updateCategory,
} from '../controllers/category.controller';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/children/:id', getChildCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);

export default router;
