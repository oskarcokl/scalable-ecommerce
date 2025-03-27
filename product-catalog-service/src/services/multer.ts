import { Request } from 'express';
import multer, { memoryStorage, FileFilterCallback } from 'multer';

const imgFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        // Reject file
        return cb(null, false);
    }

    // Accept file
    cb(null, true);
};

const upload = multer({
    storage: memoryStorage(),
    fileFilter: imgFilter,
});

export default upload;
