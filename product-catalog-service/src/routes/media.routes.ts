import { Router } from 'express';
import { createMedia, getAllMedia, getMediaByProductId } from '../controllers/media.controller';
import multer from '../services/multer';

const router = Router();

router.get('/', getAllMedia);
router.get('/:productId', getMediaByProductId);
router.post('/:productId', multer.single('media'), createMedia);
// TODO:
// - update media - Do we even need this? I feel like we can just delete and existing one and create a new one
// - delete media

export default router;
