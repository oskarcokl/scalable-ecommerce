import { Request, Response } from 'express';

import db from '../services/database';
import { productMedia } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import s3client from '../services/aws';
import { assert } from '@scalable-ecommerce/common';

const productMediaInsertSchema = createInsertSchema(productMedia);

export const getAllMedia = async (req: Request, res: Response) => {
    res.json(await db.select().from(productMedia));
};

export const getMediaById = async (req: Request, res: Response) => {
    const mediaId = parseInt(req.params.id);

    const result = await db
        .select()
        .from(productMedia)
        .where(eq(productMedia.productMediaId, mediaId));

    if (result.length === 0) {
        res.status(404).json({ message: `No media found with provided ID: ${mediaId}` });
    }
};

const bucketName = 'ecommerce-platform-public-bucket';
const region = 'eu-north-1';
export const createMedia = async (req: Request, res: Response) => {
    assert(req.params.productId, 'Product id must be provided');
    const productId = parseInt(req.params.productId);

    // Check if file
    if (!req.file) {
        res.status(400).json({
            message: 'File type not supported. Supported file types: jpg|jpeg|png|gif',
        });
        // Early return because of error
        return;
    }

    const key = generateRandomKey();
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: 'image/jpeg',
        ContentDisposition: 'inline',
    });

    try {
        const response = await s3client.send(command);
        if (response.$metadata.httpStatusCode === 200) {
            // If upload successful create a DB entry.
            const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
            const insertData = productMediaInsertSchema.parse({ productId, link: imageUrl });

            try {
                await db.insert(productMedia).values(insertData);
                res.status(201).json({ message: 'Media created successfully' });
            } catch (error) {
                // TODO: If this fails delete the image that was added to s3.
                res.status(500).json({ message: 'oopsie' });
                console.error(error);
            }
        } else {
            console.error('Unexpected S3 response:', response);
            res.status(500).json({ message: 'Unexpected response from S3' });
        }
    } catch (error) {
        if (error instanceof S3ServiceException && error.name === 'EntityTooLarge') {
            console.error('Uploaded file is too large');
            res.status(400).json({ message: 'The file you are trying to upload is too large' });
        } else if (error instanceof S3ServiceException) {
            console.error('Error from s3 while uploading image', error);
            res.status(500).json({ message: 'Error from s3 while uploading image' });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
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
