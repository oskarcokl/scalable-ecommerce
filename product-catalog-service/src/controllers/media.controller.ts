import { NextFunction, Request, Response } from 'express';

import db from '../services/database';
import { productMedia } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { DeleteObjectCommand, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import s3client from '../services/aws';
import { assert } from '@scalable-ecommerce/common';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../middleware/error.middleware';

const productMediaInsertSchema = createInsertSchema(productMedia);

export const getAllMedia = async (req: Request, res: Response) => {
    res.json(await db.select().from(productMedia));
};

export const getMediaByProductId = async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.productId);
    const result = await db
        .select()
        .from(productMedia)
        .where(eq(productMedia.productId, productId));

    if (result.length === 0) {
        return next(new NotFoundError(`No media found with provided ID: ${productId}`));
    }

    res.json(result);
};

const bucketName = 'ecommerce-platform-public-bucket';
const region = 'eu-north-1';
export const createMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assert(req.params.productId, 'Product id must be provided');
        const productId = parseInt(req.params.productId);

        if (!req.file) {
            return next(
                new BadRequestError(
                    'File type not supported. Supported file types: jpg|jpeg|png|gif'
                )
            );
        }

        const key = generateRandomKey();
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: req.file.buffer,
            ContentType: 'image/jpeg',
            ContentDisposition: 'inline',
        });

        const response = await s3client.send(command);
        if (response.$metadata.httpStatusCode !== 200) {
            return next(new InternalServerError('Unexpected response from S3'));
        }

        // If upload successful create a DB entry
        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
        const insertData = productMediaInsertSchema.parse({ productId, link: imageUrl });

        try {
            await db.insert(productMedia).values(insertData);
            res.status(201).json({ message: 'Media created successfully' });
        } catch (error) {
            // Clean up S3 file if DB insert fails
            try {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                });
                await s3client.send(deleteCommand);
                console.log('Successfully deleted failed insert');
            } catch (s3Error) {
                console.error('Failed to delete image');
            }
            return next(new InternalServerError('Failed to create media record'));
        }
    } catch (error) {
        if (error instanceof S3ServiceException) {
            if (error.name === 'EntityTooLarge') {
                return next(new BadRequestError('The file you are trying to upload is too large'));
            }
            return next(new InternalServerError('Error from S3 while uploading image'));
        }
        return next(new InternalServerError('Internal server error'));
    }
};

const generateRandomKey = (prefix?: string) => {
    const timestamp = Date.now();
    const randomString = Array.from({ length: 16 }, () =>
        Math.random().toString(36).substring(2, 3)
    ).join('');

    return prefix
        ? `${prefix}/${timestamp}-${randomString}.jpg`
        : `${timestamp}-${randomString}.jpg`;
};
