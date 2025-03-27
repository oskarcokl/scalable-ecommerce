import { Router } from 'express';
import { createMedia, getAllMedia } from '../controllers/media.controller';
import multer from '../services/multer';

const router = Router();

router.get('/', getAllMedia);
router.post('/:productId', multer.single('media'), createMedia);

export default router;
